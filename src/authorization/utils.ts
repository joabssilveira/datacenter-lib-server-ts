import axios, { AxiosResponse } from "axios";
import { ApiRoutesNames, Authorizations, ILegalPerson, IUser_Group, IUserSharedData, Users_GroupsApiClient } from "datacenter-lib-common-ts";
import { StringUtils } from "fwork-jsts-common";
import { buildQueryParams, GQLGetResponse } from 'goqlite-client';

export const undefinedUser = {} as IUserSharedData

export class DatacenterAuthBaseDataSourceUtils {
  // uuids de grupos de trabalho no qual o usuario tem determinada autorizacao
  // se o grupo de usuario esta vinculado a unidade, nao tem autorizacao sobre o grupo de trabalho, apenas a unidade
  static workgroupsUuidsUserIsAuthorized = async <AuthKeysType extends string>(args: {
    userUuid: string,
    authorizations: AuthKeysType[],
    // 
    baseDCenterApiUrl: string,
    authToken: string,
  }) => {
    let result = []

    let apiRes = await new Users_GroupsApiClient({
      baseApiUrl: args.baseDCenterApiUrl,
    }).get({
      where: {
        // grupos do usuario
        userUuid: args.userUuid,
        // e que nao sao especificos de unidades
        'userGroup.authorizations.authorizationKey': {
          $in: args.authorizations
        }
      },
      nested: 'userGroup{authorizations}',
      config: {
        headers: {
          Authorization: args.authToken
        }
      }
    })
    if (apiRes?.data?.payload?.length)
      result.push(...apiRes.data.payload.map((i: IUser_Group) => i.userGroup?.workgroupUuid))

    const tmpSet = new Set(result)
    result = Array.from(tmpSet)

    return result;
  }

  // uuids de grupos de trabalho da qual o usuario faz parte atravez de algum grupo de usuario
  // nao importa as autorizacoes que ele tenha, basta estar presente
  // geralmente usado para exibir dados limitados aos dos grupos de trabalho que o usuario faz parte
  static workgroupsUuidsFromUser = async (args: {
    userUuid: string,
    // 
    baseDCenterApiUrl: string,
    authToken: string,
  }) => {
    let result = []

    let apiRes = await new Users_GroupsApiClient({
      baseApiUrl: args.baseDCenterApiUrl
    }).get({
      where: {
        userUuid: args.userUuid,
      },
      nested: 'userGroup',
      config: {
        headers: {
          Authorization: args.authToken,
        }
      }
    })
    if (apiRes?.data?.payload?.length)
      result.push(...apiRes.data.payload.map((i: IUser_Group) => i.userGroup?.workgroupUuid))

    const tmpSet = new Set(result)
    result = Array.from(tmpSet)

    return result;
  }

  // uuids de unidades de grupos de trabalho da qual o usuario tem determinada autorizacao
  static workgroupUnitsUuidsUserIsAuthorized = async <AuthKeysType extends string>(args: {
    userUuid: string,
    authorizations: AuthKeysType[]
    // 
    baseDCenterApiUrl: string,
    authToken: string,
  }) => {
    let result = []

    let apiRes = await new Users_GroupsApiClient({
      baseApiUrl: args.baseDCenterApiUrl,
    }).get({
      where: {
        // grupos do usuario
        userUuid: args.userUuid,
        'userGroup.authorizations.authorizationKey': {
          $in: args.authorizations
        }
      },
      nested: 'userGroup{authorizations,workgroup{workgroupUnits}}',
      config: {
        headers: {
          Authorization: args.authToken
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

    const tmpSet = new Set(result)
    result = Array.from(tmpSet)

    return result;
  }

  // uuids de unidades da qual o usuario faz parte atravez de algum grupo de usuario
  // nao importa as autorizacoes que ele tenha, basta estar presente
  // geralmente usado para exibir dados limitados aos da unidade que o usuario faz parte
  static workgroupsUnitsUuidsFromUser = async (args: {
    userUuid: string,
    // 
    baseDCenterApiUrl: string,
    authToken: string,
  }) => {
    let result = []

    let apiRes = await new Users_GroupsApiClient({
      baseApiUrl: args.baseDCenterApiUrl,
    }).get({
      where: {
        userUuid: args.userUuid,
      },
      nested: 'userGroup{workgroup{workgroupUnits}}',
      config: {
        headers: {
          Authorization: args.authToken
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

  static async userIsSysAdm(options: {
    userUuid: string,
    // 
    baseDCenterApiUrl: string,
    authToken: string,
  }): Promise<boolean> {
    const apiRes = await new Users_GroupsApiClient({
      baseApiUrl: options.baseDCenterApiUrl,
    }).get({
      where: {
        $and: [
          // grupos de usuarios do usuario atual...
          { userUuid: options.userUuid },
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

    return apiRes?.data?.payload?.length ? true : false
  }

  static async checkAuthorizationInWorkgroup<AuthKeysType extends string>(options: {
    workgroupUuid: string,
    userUuid: string,
    workgroupAuthKeys?: AuthKeysType[],
    // 
    baseDCenterApiUrl: string,
    authToken: string,
  }): Promise<boolean> {
    const apiRes = await new Users_GroupsApiClient({
      baseApiUrl: options.baseDCenterApiUrl,
    }).get({
      where: {
        $and: [
          // grupos de usuarios do usuario atual...
          { userUuid: options.userUuid },
          {
            $or: [
              // ...ou com permissao sysadm
              { 'userGroup.authorizations.authorizationKey': Authorizations.sysAdm },
              {
                $and: [
                  // ...e que façam parte do grupo de trabalho atual vindo direto pelo grupo de usuarios...
                  { 'userGroup.workgroupUuid': options.workgroupUuid },
                  // ...e que nao seja especifico de alguma unidade
                  { 'userGroup.workgroupUnitUuid': null },
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

    return apiRes?.data?.payload?.length ? true : false
  }

  // static async checkAuthorizationInWorkgroupUnit<AuthKeysType extends string>(options: {
  //   workgroupUnitUuid: string,
  //   userUuid: string,
  //   workgroupUnitsAuthKeys?: AuthKeysType[],
  //   // 
  //   baseDCenterApiUrl: string,
  //   authToken: string,
  // }): Promise<boolean> {
  //   if (StringUtils.isEmpty(options.userUuid)) return false

  //   const legalPersonsApiRes = await new LegalPersonsApiClient({
  //     baseApiUrl: options.baseDCenterApiUrl,
  //   }).get({
  //     where: {
  //       uuid: options.workgroupUnitUuid
  //     },
  //     config: {
  //       headers: {
  //         Authorization: options.authToken,
  //       }
  //     }
  //   })

  //   const workgroupUuid = legalPersonsApiRes?.data?.payload?.[0]?.workgroupUuid ?? '';
  //   const users_groupsApiRes = await new Users_GroupsApiClient({
  //     baseApiUrl: options.baseDCenterApiUrl,
  //   }).get({
  //     where: {
  //       $and: [
  //         // grupos de usuarios do usuario atual...
  //         { userUuid: options.userUuid },
  //         {
  //           $or: [
  //             // ... ou com permissao sysadm
  //             { 'userGroup.authorizations.authorizationKey': Authorizations.sysAdm },
  //             {
  //               $and: [
  //                 // ...e que façam parte do grupo de trabalho atual vindo direto pelo grupo de usuarios...
  //                 { 'userGroup.workgroupUuid': workgroupUuid },
  //                 // ...e que nao seja especifico de alguma unidade
  //                 { 'userGroup.workgroupUnitUuid': null },
  //                 // ...e com permissao workgroupAdm ou alguma outra permissao no grupo de trabalho
  //                 { 'userGroup.authorizations.authorizationKey': { $in: [Authorizations.workgroupAdm, ...(options.workgroupUnitsAuthKeys ?? [])] } },
  //               ]
  //             },
  //             {
  //               $and: [
  //                 // ...e que seja especifico da unidade...
  //                 { 'userGroup.workgroupUnitUuid': options.workgroupUnitUuid },
  //                 // ...e com permissao workgroupUnitAdm ou alguma outra permissao na unidade
  //                 { 'userGroup.authorizations.authorizationKey': { $in: [Authorizations.workgroupUnitAdm, ...(options.workgroupUnitsAuthKeys ?? [])] } },
  //               ]
  //             },
  //           ]
  //         },
  //       ]
  //     },
  //     nested: 'userGroup{workgroupUnit{legalPerson},authorizations}',
  //     config: {
  //       headers: {
  //         Authorization: options.authToken
  //       }
  //     }
  //   })

  //   return users_groupsApiRes?.data?.payload?.length ? true : false
  // }
  static async checkAuthorizationInWorkgroupUnit<AuthKeysType extends string>(options: {
    workgroupUnitUuid: string,
    userUuid: string,
    workgroupUnitsAuthKeys?: AuthKeysType[],
    // 
    baseDCenterApiUrl: string,
    authToken: string,
  }): Promise<boolean> {
    if (StringUtils.isEmpty(options.userUuid)) return false

    const apiRes: AxiosResponse<GQLGetResponse<ILegalPerson>> = await axios.get(
      `${options.baseDCenterApiUrl}${ApiRoutesNames.legalPersons}`,
      {
        params: {
          ...buildQueryParams<ILegalPerson>({
            where: {
              uuid: options.workgroupUnitUuid
            }
          })
        },
        headers: {
          Authorization: options.authToken,
        }
      },
    )

    if (apiRes.status != 200) {
      return false
    }

    const workgroupUuid = apiRes?.data?.payload?.[0]?.workgroupUuid ?? '';
    const users_groupsApiRes = await new Users_GroupsApiClient({
      baseApiUrl: options.baseDCenterApiUrl,
    }).get({
      where: {
        $and: [
          // grupos de usuarios do usuario atual...
          { userUuid: options.userUuid },
          {
            $or: [
              // ... ou com permissao sysadm
              { 'userGroup.authorizations.authorizationKey': Authorizations.sysAdm },
              {
                $and: [
                  // ...e que façam parte do grupo de trabalho atual vindo direto pelo grupo de usuarios...
                  { 'userGroup.workgroupUuid': workgroupUuid },
                  // ...e que nao seja especifico de alguma unidade
                  { 'userGroup.workgroupUnitUuid': null },
                  // ...e com permissao workgroupAdm ou alguma outra permissao no grupo de trabalho
                  { 'userGroup.authorizations.authorizationKey': { $in: [Authorizations.workgroupAdm, ...(options.workgroupUnitsAuthKeys ?? [])] } },
                ]
              },
              {
                $and: [
                  // ...e que seja especifico da unidade...
                  { 'userGroup.workgroupUnitUuid': options.workgroupUnitUuid },
                  // ...e com permissao workgroupUnitAdm ou alguma outra permissao na unidade
                  { 'userGroup.authorizations.authorizationKey': { $in: [Authorizations.workgroupUnitAdm, ...(options.workgroupUnitsAuthKeys ?? [])] } },
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

    return users_groupsApiRes?.data?.payload?.length ? true : false
  }
}