import { Authorizations, IUser_Group, IUserSharedData, LegalPersonsApiClient, Users_GroupsApiClient } from "datacenter-lib-common-ts";

export const undefinedUser = {} as IUserSharedData

export class DatacenterAuthBaseDataSourceUtils {
  // uuids de grupos de trabalho no qual o usuario tem determinada autorizacao
  static workgroupsUuidsFromUserWhereHeHasSomeAuth = async <AuthKeysType extends string>(args: {
    baseDCenterApiUrl: string,
    authToken: string,
    user: IUserSharedData,
    authorizations: AuthKeysType[]
  }) => {
    let result = []

    let response = await new Users_GroupsApiClient({
      baseApiUrl: args.baseDCenterApiUrl,
    }).get({
      where: {
        userUuid: args.user.uuid,
        'userGroup.authorizations.authorizationKey': {
          $in: args.authorizations
        }
      },
      nested: 'userGroup{workgroupUnit{legalPerson},authorizations}',
      config: {
        headers: {
          Authorization: args.authToken
        }
      }
    })
    if (response?.data?.payload?.length)
      result.push(...response.data.payload.map((i: IUser_Group) => i.userGroup?.workgroupUnit?.legalPerson?.workgroupUuid))

    const tmpSet = new Set(result)
    result = Array.from(tmpSet)

    return result;
  }

  // uuids de grupos de trabalho da qual o usuario faz parte atravez de algum grupo de usuario
  // nao importa as autorizacoes que ele tenha, basta estar presente
  static workgroupsUuidsFromUser = async (args: {
    baseDCenterApiUrl: string,
    authToken: string,
    user: IUserSharedData,
  }) => {
    let result = []

    let response = await new Users_GroupsApiClient({
      baseApiUrl: args.baseDCenterApiUrl
    }).get({
      where: {
        userUuid: args.user.uuid,
      },
      nested: 'userGroup{workgroupUnit{legalPerson}}',
      config: {
        headers: {
          Authorization: args.authToken,
        }
      }
    })
    if (response?.data?.payload?.length)
      result.push(...response.data.payload.map((i: IUser_Group) => i.userGroup?.workgroupUnit?.legalPerson?.workgroupUuid))

    const tmpSet = new Set(result)
    result = Array.from(tmpSet)

    return result;
  }

  // uuids de unidades de grupos de trabalho da qual o usuario tem determinada autorizacao
  static workgroupsUnitsUuidsFromUserWhereHeHasSomeAuth = async <AuthKeysType extends string>(args: {
    baseDCenterApiUrl: string,
    authToken: string,
    user: IUserSharedData,
    authorizations: AuthKeysType[]
  }) => {
    let result = []

    let response = await new Users_GroupsApiClient({
      baseApiUrl: args.baseDCenterApiUrl,
    }).get({
      where: {
        userUuid: args.user.uuid,
        'userGroup.authorizations.authorizationKey': {
          $in: args.authorizations
        }
      },
      nested: 'userGroup{workgroupUnit{legalPerson},authorizations}',
      config: {
        headers: {
          Authorization: args.authToken
        }
      }
    })
    if (response?.data?.payload?.length)
      result.push(...response.data.payload.map((i: IUser_Group) => i.userGroup?.workgroupUnit?.legalPersonUuid))

    const tmpSet = new Set(result)
    result = Array.from(tmpSet)

    return result;
  }

  // uuids de unidades de grupos de trabalho da qual o usuario faz parte atravez de algum grupo de usuario
  // nao importa as autorizacoes que ele tenha, basta estar presente
  static workgroupsUnitsUuidsFromUser = async (args: {
    baseDCenterApiUrl: string,
    authToken: string,
    user: IUserSharedData,
  }) => {
    let result = []

    let response = await new Users_GroupsApiClient({
      baseApiUrl: args.baseDCenterApiUrl,
    }).get({
      where: {
        userUuid: args.user.uuid,
      },
      nested: 'userGroup{workgroupUnit}',
      config: {
        headers: {
          Authorization: args.authToken
        }
      }
    })
    if (response?.data?.payload?.length)
      result.push(...response.data.payload.map((i: IUser_Group) => i.userGroup?.workgroupUnit?.legalPersonUuid))

    const tmpSet = new Set(result)
    result = Array.from(tmpSet)

    return result;
  }

  static async checkUserIsInWorkgroup(options: {
    baseDCenterApiUrl: string,
    authToken: string,
    user: IUserSharedData,
    workgroupUuid: string,
  }) {
    const users_groupsDbRes = await new Users_GroupsApiClient({
      baseApiUrl: options.baseDCenterApiUrl,
    }).get({
      where: {
        // grupos de usuarios do usuario atual...
        userUuid: options.user.uuid,
        // ...e que pertenca ao grupo de trabalho atual
        'userGroup.workgroupUnit.legalPerson.workgroupUuid': options.workgroupUuid,
      },
      nested: 'userGroup{workgroupUnit{legalPerson}}',
      config: {
        headers: {
          Authorization: options.authToken
        }
      }
    })

    return users_groupsDbRes?.data?.payload?.length ? true : false
  }

  static async checkAuthorizationSysAdm(options: {
    baseDCenterApiUrl: string,
    authToken: string,
    user: IUserSharedData,
  }): Promise<boolean> {
    const users_groupsDbRes = await new Users_GroupsApiClient({
      baseApiUrl: options.baseDCenterApiUrl,
    }).get({
      where: {
        $and: [
          // grupos de usuarios do usuario atual...
          { userUuid: options.user.uuid },
          // ...e que tenha permissao sysAdm, nao importa o grupo de trabalho nem a unidade
          { 'userGroup.authorizations.authorizationKey': Authorizations.sysAdm }
        ]
      },
      nested: 'userGroup{authorizations}',
      config: {
        headers: {
          Authorization: options.authToken
        }
      }
    })

    return users_groupsDbRes?.data?.payload?.length ? true : false
  }

  static async checkAuthorizationFromWorkgroup<AuthKeysType extends string>(options: {
    baseDCenterApiUrl: string,
    authToken: string,
    workgroupUuid: string,
    user: IUserSharedData,
    // workgroupAuthKeys?: AuthorizationKeys[],
    workgroupAuthKeys?: AuthKeysType[],
  }): Promise<boolean> {
    const users_groupsDbRes = await new Users_GroupsApiClient({
      baseApiUrl: options.baseDCenterApiUrl,
    }).get({
      where: {
        $and: [
          // grupos de usuarios do usuario atual...
          { userUuid: options.user.uuid },
          {
            $or: [
              // ...ou com permissao sysadm
              { 'userGroup.authorizations.authorizationKey': Authorizations.sysAdm },
              {
                $and: [
                  // ...ou que façam parte do grupo de trabalho atual...
                  { 'userGroup.workgroupUnit.legalPerson.workgroupUuid': options.workgroupUuid },
                  // ...e com permissao workgroupAdm ou alguma outra permissao no grupo de trabalho
                  { 'userGroup.authorizations.authorizationKey': { $in: [Authorizations.workgroupAdm, ...(options.workgroupAuthKeys ?? [])] } },

                ]
              }
            ]
          }
        ]
      },
      nested: 'userGroup{workgroupUnit{legalPerson},authorizations}',
      config: {
        headers: {
          Authorization: options.authToken
        }
      }
    })

    return users_groupsDbRes?.data?.payload?.length ? true : false
  }

  static async checkAuthorizationFromWorkgroupUnit<AuthKeysType extends string>(options: {
    baseDCenterApiUrl: string,
    authToken: string,
    legalPersonUuid: string,
    user: IUserSharedData,
    // workgroupUnitsAuthKeys?: AuthorizationKeys[],
    workgroupUnitsAuthKeys?: AuthKeysType[],
  }): Promise<boolean> {
    const legalPersonsDsRes = await new LegalPersonsApiClient({
      baseApiUrl: options.baseDCenterApiUrl,
    }).get({
      where: {
        uuid: options.legalPersonUuid
      },
      config: {
        headers: {
          Authorization: options.authToken,
        }
      }
    })

    const workgroupUuid = legalPersonsDsRes?.data?.payload?.[0]?.workgroupUuid ?? '';
    const legalPersonUuid = options.legalPersonUuid
    const users_groupsDbRes = await new Users_GroupsApiClient({
      baseApiUrl: options.baseDCenterApiUrl,
    }).get({
      where: {
        $and: [
          // grupos de usuarios do usuario atual...
          { userUuid: options.user.uuid },
          {
            $or: [
              // ... ou com permissao sysadm
              { 'userGroup.authorizations.authorizationKey': Authorizations.sysAdm },
              {
                $and: [
                  // ...ou que façam parte do grupo de trabalho atual...
                  { 'userGroup.workgroupUnit.legalPerson.workgroupUuid': workgroupUuid },
                  // ...e com permissao workgroupAdm 
                  { 'userGroup.authorizations.authorizationKey': Authorizations.workgroupAdm }
                ]
              },
              {
                $and: [
                  // ...ou que façam parte da unidade atual
                  { 'userGroup.workgroupUnit.legalPersonUuid': legalPersonUuid },
                  // ...e com permissao workgroupUnitAdm ou alguma outra permissao na unidade
                  { 'userGroup.authorizations.authorizationKey': { $in: [Authorizations.workgroupUnitAdm, ...(options.workgroupUnitsAuthKeys ?? [])] } },
                ]
              }
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

    return users_groupsDbRes?.data?.payload?.length ? true : false
  }
}