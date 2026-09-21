import {
  AuthorizationKeys, DatacenterCrudAuthTokenDataDefault,
  DatacenterCrudAuthTokenDataIntegration, DatacenterCrudAuthTypes,
  DatacenterCrudAuthUser,
  getAgentUuidFromCrudAuth,
  IntegrationClient_AuthorizationsApiClient, IntegrationClientsApiClient, IUser_Group, IUserSharedData,
  LegalPersonsApiClient, Users_GroupsApiClient
} from "datacenter-lib-common-ts";

export const undefinedUser = {} as IUserSharedData

export class DatacenterAuthBaseDataSourceUtils {
  // uuids de grupos de trabalho no qual o usuario tem determinada autorizacao
  // se o grupo de usuario esta vinculado a unidade, nao tem autorizacao sobre o grupo de trabalho, apenas a unidade
  static workgroupsUuidsAgentIsAuthorized = async <AuthKeysType extends string>(options: {
    crudAuth: DatacenterCrudAuthUser | DatacenterCrudAuthTokenDataDefault | DatacenterCrudAuthTokenDataIntegration,
    authorizations: AuthKeysType[],
    // 
    baseDCenterApiUrl: string,
    authToken: string,
  }) => {
    let result = []

    if ([DatacenterCrudAuthTypes.tokenDataDefault, DatacenterCrudAuthTypes.user].includes(options.crudAuth.type)) {
      let apiRes = await new Users_GroupsApiClient({
        baseApiUrl: options.baseDCenterApiUrl,
      }).get({
        where: {
          // grupos do usuario
          userUuid: getAgentUuidFromCrudAuth({ crudAuth: options.crudAuth as any }),
          // e que nao sao especificos de unidades
          'userGroup.workgroupUnitUuid': null,
          // e que nao sao especificos de unidades
          'userGroup.authorizations.authorizationKey': {
            $in: options.authorizations
          }
        },
        nested: 'userGroup{authorizations}',
        config: {
          headers: {
            Authorization: options.authToken
          }
        }
      })
      if (apiRes?.data?.payload?.length)
        result.push(...apiRes.data.payload.map((i: IUser_Group) => i.userGroup?.workgroupUuid))
    } else if (options.crudAuth.type == DatacenterCrudAuthTypes.tokenDataIntegration) {
      let apiRes = await new IntegrationClient_AuthorizationsApiClient({
        baseApiUrl: options.baseDCenterApiUrl,
      }).get({
        where: {
          integrationClientUuid: options.crudAuth.tokenData.clientUuid,
          authorizationKey: {
            $in: options.authorizations
          }
        },
        nested: 'integrationClient',
        config: {
          headers: {
            Authorization: options.authToken
          }
        }
      })
      if (apiRes?.data?.payload?.length)
        result.push(...apiRes.data.payload.map(i => i.integrationClient?.workgroupUuid)
          .filter((a): a is string => a != null))
    }

    const tmpSet = new Set(result)
    result = Array.from(tmpSet)

    return result;
  }

  // uuids de grupos de trabalho da qual o usuario faz parte atravez de algum grupo de usuario
  // nao importa as autorizacoes que ele tenha, basta estar presente
  // geralmente usado para exibir dados limitados aos dos grupos de trabalho que o usuario faz parte
  static workgroupsUuidsFromUser = async (options: {
    crudAuth: DatacenterCrudAuthUser | DatacenterCrudAuthTokenDataDefault | DatacenterCrudAuthTokenDataIntegration,
    // 
    baseDCenterApiUrl: string,
    authToken: string,
  }) => {
    let result: string[] = []

    if ([DatacenterCrudAuthTypes.tokenDataDefault, DatacenterCrudAuthTypes.user].includes(options.crudAuth.type)) {
      let apiRes = await new Users_GroupsApiClient({
        baseApiUrl: options.baseDCenterApiUrl
      }).get({
        where: {
          userUuid: getAgentUuidFromCrudAuth({ crudAuth: options.crudAuth as any }),
        },
        nested: 'userGroup',
        config: {
          headers: {
            Authorization: options.authToken,
          }
        }
      })
      if (apiRes?.data?.payload?.length)
        result.push(...apiRes.data.payload.map((i: IUser_Group) => i.userGroup?.workgroupUuid).filter((a): a is string => a != null))

      const tmpSet = new Set(result)
      result = Array.from(tmpSet)
    } else if (options.crudAuth.type == DatacenterCrudAuthTypes.tokenDataIntegration) {
      let apiRes = await new IntegrationClientsApiClient({
        baseApiUrl: options.baseDCenterApiUrl
      }).get({
        where: {
          uuid: options.crudAuth.tokenData.clientUuid
        },
        config: {
          headers: {
            Authorization: options.authToken,
          }
        }
      })
      if (apiRes?.data?.payload?.length)
        result.push(apiRes.data.payload[0].workgroupUuid)
    }

    return result;
  }

  // uuids de unidades de grupos de trabalho da qual o usuario tem determinada autorizacao
  static workgroupUnitsUuidsAgentIsAuthorized = async <AuthKeysType extends string>(options: {
    crudAuth: DatacenterCrudAuthUser | DatacenterCrudAuthTokenDataDefault | DatacenterCrudAuthTokenDataIntegration,
    authorizations: AuthKeysType[]
    // 
    baseDCenterApiUrl: string,
    authToken: string,
  }) => {
    if (!options.authorizations.length) return []

    let result = []

    if ([DatacenterCrudAuthTypes.tokenDataDefault, DatacenterCrudAuthTypes.user].includes(options.crudAuth.type)) {
      let apiRes = await new Users_GroupsApiClient({
        baseApiUrl: options.baseDCenterApiUrl,
      }).get({
        where: {
          // grupos do usuario
          userUuid: getAgentUuidFromCrudAuth({ crudAuth: options.crudAuth as any }),
          'userGroup.authorizations.authorizationKey': {
            $in: options.authorizations
          }
        },
        nested: 'userGroup{authorizations,workgroup{workgroupUnits}}',
        config: {
          headers: {
            Authorization: options.authToken
          }
        }
      })
      if (apiRes?.data?.payload?.length) {
        // grupos de usuarios que nao sao especificos de unidades
        // se o grupo de usuarios nao tem workgroupUnitUuid definido, posso trazer as unidadades do grupo de trabalho referente ao grupo de usuarios
        const a = apiRes.data.payload.filter(i => !i.userGroup?.workgroupUnitUuid).flatMap(i => i.userGroup?.workgroup?.workgroupUnits?.map(i => i.legalPersonUuid)).filter((a): a is string => a != null)

        // grupos de usuario que sao especificos de unidades
        // se o grupo de usuarios tem workgroupUnitUuid definido, so posso trazer a unidade desse grupo de usuarios
        const b = apiRes.data.payload.filter(i => i.userGroup?.workgroupUnitUuid).map(i => i.userGroup?.workgroupUnitUuid).filter((a): a is string => a != null)

        result.push(...a, ...b)
      }
    } else if (options.crudAuth.type == DatacenterCrudAuthTypes.tokenDataIntegration) {
      let apiRes = await new IntegrationClientsApiClient({
        baseApiUrl: options.baseDCenterApiUrl,
      }).get({
        where: {
          uuid: options.crudAuth.tokenData.clientUuid,
          'authorizations.authorizationKey': {
            $in: options.authorizations
          }
        },
        nested: 'workgroup{workgroupUnits},authorizations',
        config: {
          headers: {
            Authorization: options.authToken
          }
        }
      })

      let uuids = apiRes?.data?.payload
        ?.flatMap(i => i.workgroup?.workgroupUnits?.map(u => u.legalPersonUuid))
        // https://chatgpt.com/share/6ab06347-0bf0-83e9-b056-7a52ef6e7fcc
        .filter((u): u is string => u != null)

      if (uuids?.length)
        result.push(...uuids)
    }

    const tmpSet = new Set(result)
    result = Array.from(tmpSet)

    return result;
  }

  // uuids de unidades da qual o usuario faz parte atravez de algum grupo de usuario
  // nao importa as autorizacoes que ele tenha, basta estar presente
  // geralmente usado para exibir dados limitados aos da unidade que o usuario faz parte
  static workgroupsUnitsUuidsFromAgent = async (options: {
    crudAuth: DatacenterCrudAuthUser | DatacenterCrudAuthTokenDataDefault | DatacenterCrudAuthTokenDataIntegration,
    // 
    baseDCenterApiUrl: string,
    authToken: string,
  }) => {
    let result: string[] = []

    if ([DatacenterCrudAuthTypes.tokenDataDefault, DatacenterCrudAuthTypes.user].includes(options.crudAuth.type)) {
      let apiRes = await new Users_GroupsApiClient({
        baseApiUrl: options.baseDCenterApiUrl,
      }).get({
        where: {
          userUuid: getAgentUuidFromCrudAuth({ crudAuth: options.crudAuth as any }),
        },
        nested: 'userGroup{workgroup{workgroupUnits}}',
        config: {
          headers: {
            Authorization: options.authToken
          }
        }
      })
      if (apiRes?.data?.payload?.length) {
        // grupos de usuarios que nao sao especificos de unidades
        // se o grupo de usuarios nao tem workgroupUnitUuid definido, posso trazer as unidadades do grupo de trabalho referente ao grupo de usuarios
        const a = apiRes.data.payload.filter(i => !i.userGroup?.workgroupUnitUuid).flatMap(i => i.userGroup?.workgroup?.workgroupUnits?.map(i => i.legalPersonUuid)).filter((a): a is string => a != null)

        // grupos de usuario que sao especificos de unidades
        // se o grupo de usuarios tem workgroupUnitUuid definido, so posso trazer a unidade desse grupo de usuarios
        const b = apiRes.data.payload.filter(i => i.userGroup?.workgroupUnitUuid).map(i => i.userGroup?.workgroupUnitUuid).filter((a): a is string => a != null)

        result.push(...a, ...b)
      }
    } else if (options.crudAuth.type == DatacenterCrudAuthTypes.tokenDataIntegration) {
      let dbRes = await new IntegrationClientsApiClient({
        baseApiUrl: options.baseDCenterApiUrl,
      }).get({
        where: {
          uuid: options.crudAuth.tokenData.clientUuid,
        },
        nested: 'workgroup{workgroupUnits},authorizations',
        config: {
          headers: {
            Authorization: options.authToken
          }
        }
      })

      let uuids = dbRes?.data?.payload
        ?.flatMap(i => i.workgroup?.workgroupUnits?.map(u => u.legalPersonUuid))
        // https://chatgpt.com/share/6ab06347-0bf0-83e9-b056-7a52ef6e7fcc
        .filter((u): u is string => u != null)

      if (uuids?.length)
        result.push(...uuids)
    }

    const tmpSet = new Set(result)
    result = Array.from(tmpSet)

    return result;
  }

  // sem referencias de uso dessa funcao
  static async userIsInWorkgroup(options: {
    userUuid: string,
    workgroupUuid: string,
    // 
    baseDCenterApiUrl: string,
    authToken: string,
  }) {
    const apiRes = await new Users_GroupsApiClient({
      baseApiUrl: options.baseDCenterApiUrl,
    }).get({
      where: {
        // grupos de usuarios do usuario atual...
        userUuid: options.userUuid,
        // ...e que pertenca ao grupo de trabalho atual vindo pela unidade
        'userGroup.workgroupUuid': options.workgroupUuid,
      },
      nested: 'userGroup',
      config: {
        headers: {
          Authorization: options.authToken
        }
      }
    })

    return apiRes?.data?.payload?.length ? true : false
  }

  static async agentIsSysAdm(options: {
    crudAuth: DatacenterCrudAuthUser | DatacenterCrudAuthTokenDataDefault | DatacenterCrudAuthTokenDataIntegration,
    // 
    baseDCenterApiUrl: string,
    authToken: string,
  }): Promise<boolean> {
    let result = false

    if ([DatacenterCrudAuthTypes.tokenDataDefault, DatacenterCrudAuthTypes.user].includes(options.crudAuth.type)) {
      const apiRes = await new Users_GroupsApiClient({
        baseApiUrl: options.baseDCenterApiUrl,
      }).get({
        where: {
          $and: [
            // grupos de usuarios do usuario atual...
            { userUuid: getAgentUuidFromCrudAuth({ crudAuth: options.crudAuth as any }), },
            // ...e que tenha permissao sysAdm, nao importa o grupo de trabalho nem a unidade
            { 'userGroup.authorizations.authorizationKey': AuthorizationKeys.sysAdm }
          ]
        },
        nested: 'userGroup{authorizations}',
        config: {
          headers: {
            Authorization: options.authToken
          }
        }
      })

      result = apiRes?.data?.payload?.length ? true : false
    } else if (options.crudAuth.type == DatacenterCrudAuthTypes.tokenDataIntegration) {
      let apiRes = await new IntegrationClientsApiClient({
        baseApiUrl: options.baseDCenterApiUrl,
      }).get({
        where: {
          uuid: options.crudAuth.tokenData.clientUuid,
          'authorizations.authorizationKey': AuthorizationKeys.sysAdm
        },
        nested: 'authorizations',
        config: {
          headers: {
            Authorization: options.authToken
          }
        }
      })

      result = apiRes?.data?.payload?.length ? true : false
    }

    return result
  }

  static async agentHasAuthorizationInWorkgroup<AuthKeysType extends string>(options: {
    workgroupUuid: string,
    crudAuth: DatacenterCrudAuthUser | DatacenterCrudAuthTokenDataDefault | DatacenterCrudAuthTokenDataIntegration,
    workgroupAuthKeys?: AuthKeysType[],
    // 
    baseDCenterApiUrl: string,
    authToken: string,
  }): Promise<boolean> {
    let result = false

    if ([DatacenterCrudAuthTypes.tokenDataDefault, DatacenterCrudAuthTypes.user].includes(options.crudAuth.type)) {
      const apiRes = await new Users_GroupsApiClient({
        baseApiUrl: options.baseDCenterApiUrl,
      }).get({
        where: {
          $and: [
            // grupos de usuarios do usuario atual...
            { userUuid: getAgentUuidFromCrudAuth({ crudAuth: options.crudAuth as any }), },
            {
              $or: [
                // ...ou com permissao sysadm
                { 'userGroup.authorizations.authorizationKey': AuthorizationKeys.sysAdm },
                {
                  $and: [
                    // ...e que façam parte do grupo de trabalho atual vindo direto pelo grupo de usuarios...
                    { 'userGroup.workgroupUuid': options.workgroupUuid },
                    // ...e que nao seja especifico de alguma unidade
                    { 'userGroup.workgroupUnitUuid': null },
                    // ...e com permissao workgroupAdm ou alguma outra permissao no grupo de trabalho
                    { 'userGroup.authorizations.authorizationKey': { $in: [AuthorizationKeys.workgroupAdm, ...(options.workgroupAuthKeys ?? [])] } },
                  ]
                }
              ]
            }
          ]
        },
        nested: 'userGroup{authorizations}',
        config: {
          headers: {
            Authorization: options.authToken
          }
        }
      })

      result = apiRes?.data?.payload?.length ? true : false
    } else if (options.crudAuth.type == DatacenterCrudAuthTypes.tokenDataIntegration) {
      let dbRes = await new IntegrationClientsApiClient({
        baseApiUrl: options.baseDCenterApiUrl,
      }).get({
        where: {
          $and: [
            { uuid: options.crudAuth.tokenData.clientUuid, },
            {
              $or: [
                // ...ou com permissao sysadm
                { 'authorizations.authorizationKey': AuthorizationKeys.sysAdm },
                {
                  $and: [
                    // ...e que façam parte do grupo de trabalho atual...
                    { 'workgroupUuid': options.workgroupUuid },
                    // ...e com permissao workgroupAdm ou alguma outra permissao no grupo de trabalho
                    { 'authorizations.authorizationKey': { $in: [AuthorizationKeys.workgroupAdm, ...(options.workgroupAuthKeys ?? [])] } },
                  ]
                }
              ]
            }
          ]
        },
        nested: 'authorizations',
        config: {
          headers: {
            Authorization: options.authToken
          }
        }
      })

      result = dbRes?.data?.payload?.length ? true : false
    }

    return result
  }

  static async agentHasAuthorizationInWorkgroupUnit<AuthKeysType extends string>(options: {
    workgroupUnitUuid: string,
    crudAuth: DatacenterCrudAuthUser | DatacenterCrudAuthTokenDataDefault | DatacenterCrudAuthTokenDataIntegration,
    workgroupUnitsAuthKeys?: AuthKeysType[],
    // 
    baseDCenterApiUrl: string,
    authToken: string,
  }): Promise<boolean> {
    let result = false

    const legalPersonsDsRes = await new LegalPersonsApiClient({
      baseApiUrl: options.baseDCenterApiUrl,
    }).get({
      where: {
        uuid: options.workgroupUnitUuid
      },
      config: {
        headers: {
          Authorization: options.authToken
        }
      }
    })

    const workgroupUuid = legalPersonsDsRes?.data?.payload?.[0]?.workgroupUuid ?? '';

    if ([DatacenterCrudAuthTypes.tokenDataDefault, DatacenterCrudAuthTypes.user].includes(options.crudAuth.type)) {
      const users_groupsDbRes = await new Users_GroupsApiClient({
        baseApiUrl: options.baseDCenterApiUrl,
      }).get({
        where: {
          $and: [
            // grupos de usuarios do usuario atual...
            { userUuid: getAgentUuidFromCrudAuth({ crudAuth: options.crudAuth as any }), },
            {
              $or: [
                // ... ou com permissao sysadm
                { 'userGroup.authorizations.authorizationKey': AuthorizationKeys.sysAdm },
                {
                  $and: [
                    // ...e que façam parte do grupo de trabalho atual vindo direto pelo grupo de usuarios...
                    { 'userGroup.workgroupUuid': workgroupUuid },
                    // ...e que nao seja especifico de alguma unidade
                    { 'userGroup.workgroupUnitUuid': null },
                    // ...e com permissao workgroupAdm ou alguma outra permissao no grupo de trabalho
                    { 'userGroup.authorizations.authorizationKey': { $in: [AuthorizationKeys.workgroupAdm, ...(options.workgroupUnitsAuthKeys ?? [])] } },
                  ]
                },
                {
                  $and: [
                    // ...e que seja especifico da unidade...
                    { 'userGroup.workgroupUnitUuid': options.workgroupUnitUuid },
                    // ...e com permissao workgroupUnitAdm ou alguma outra permissao na unidade
                    { 'userGroup.authorizations.authorizationKey': { $in: [AuthorizationKeys.workgroupUnitAdm, ...(options.workgroupUnitsAuthKeys ?? [])] } },
                  ]
                },
              ]
            },
          ]
        },
        nested: 'userGroup{workgroupUnit{legalPerson},authorizations}',
        config: {
          headers: {
            Authorization: options.authToken
          }
        }
      })

      result = users_groupsDbRes?.data?.payload?.length ? true : false
    } else if (options.crudAuth.type == DatacenterCrudAuthTypes.tokenDataIntegration) {
      let dbRes = await new IntegrationClientsApiClient({
        baseApiUrl: options.baseDCenterApiUrl,
      }).get({
        where: {
          $and: [
            { uuid: options.crudAuth.tokenData.clientUuid, },
            {
              $or: [
                // ...ou com permissao sysadm
                { 'authorizations.authorizationKey': AuthorizationKeys.sysAdm },
                {
                  $and: [
                    // ...e que façam parte do grupo de trabalho atual...
                    { 'workgroupUuid': workgroupUuid },
                    // ...e com permissao workgroupAdm ou alguma outra permissao no grupo de trabalho
                    { 'authorizations.authorizationKey': { $in: [AuthorizationKeys.workgroupAdm, ...(options.workgroupUnitsAuthKeys ?? [])] } },
                  ]
                }
              ]
            }
          ]
        },
        nested: 'authorizations',
        config: {
          headers: {
            Authorization: options.authToken
          }
        }
      })

      result = dbRes?.data?.payload?.length ? true : false
    }

    return result
  }
}