import { IAuthenticationTokenData } from "datacenter-lib-common-ts"
import {
  ISequelizeBulkCreateOptions, ISequelizeCreateOptions, ISequelizeDeleteByKeyOptions, ISequelizeDeleteOptions,
  ISequelizeGetOptions, ISequelizeUpdateOptions
} from "fwork-jsts-db"

export interface IDatacenterAuthBaseBulkCreateOptions<T> extends ISequelizeBulkCreateOptions<T> {
  baseDCenterApiUrl: string | undefined,
  authToken: string | undefined,
  authTokenData: IAuthenticationTokenData | undefined
  skipAuthorization: boolean
}

export interface IDatacenterAuthBaseCreateOptions<T> extends ISequelizeCreateOptions<T> {
  baseDCenterApiUrl: string | undefined,
  authToken: string | undefined,
  authTokenData: IAuthenticationTokenData | undefined
  skipAuthorization: boolean
}

export interface IDatacenterAuthBaseGetOptions<T> extends ISequelizeGetOptions<T> {
  baseDCenterApiUrl: string | undefined,
  authToken: string | undefined,
  authTokenData: IAuthenticationTokenData | undefined
  skipAuthorization: boolean
}

export interface IDatacenterAuthBaseUpdateOptions<T> extends ISequelizeUpdateOptions<T> {
  baseDCenterApiUrl: string | undefined,
  authToken: string | undefined,
  authTokenData: IAuthenticationTokenData | undefined
  skipAuthorization: boolean
}

export interface IDatacenterAuthBaseDeleteByKeyOptions<T> extends ISequelizeDeleteByKeyOptions<T> {
  baseDCenterApiUrl: string | undefined,
  authToken: string | undefined,
  authTokenData: IAuthenticationTokenData | undefined
  skipAuthorization: boolean
}

export interface IDatacenterAuthBaseDeleteOptions<T> extends ISequelizeDeleteOptions<T> {
  baseDCenterApiUrl: string | undefined,
  authToken: string | undefined,
  authTokenData: IAuthenticationTokenData | undefined
  skipAuthorization: boolean
}