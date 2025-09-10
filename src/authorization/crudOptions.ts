import { IUserSharedData } from "datacenter-lib-common-ts"
import { ISequelizeBulkCreateOptions, ISequelizeCreateOptions, ISequelizeDeleteByKeyOptions, ISequelizeDeleteOptions, 
  ISequelizeGetOptions, ISequelizeUpdateOptions } from "fwork-jsts-db"

export interface IDatacenterAuthBaseBulkCreateOptions<T> extends ISequelizeBulkCreateOptions<T> {
  baseDCenterApiUrl: string,
  authToken: string,
  user: IUserSharedData,
  skipAuthorization: boolean
}

export interface IDatacenterAuthBaseCreateOptions<T> extends ISequelizeCreateOptions<T> {
  baseDCenterApiUrl: string,
  authToken: string,
  user: IUserSharedData,
  skipAuthorization: boolean
}

export interface IDatacenterAuthBaseGetOptions<T> extends ISequelizeGetOptions<T> {
  baseDCenterApiUrl: string,
  authToken: string,
  user: IUserSharedData,
  skipAuthorization: boolean
}

export interface IDatacenterAuthBaseUpdateOptions<T> extends ISequelizeUpdateOptions<T> {
  baseDCenterApiUrl: string,
  authToken: string,
  user: IUserSharedData,
  skipAuthorization: boolean
}

export interface IDatacenterAuthBaseDeleteByKeyOptions<T> extends ISequelizeDeleteByKeyOptions<T> {
  baseDCenterApiUrl: string,
  authToken: string,
  user: IUserSharedData,
  skipAuthorization: boolean
}

export interface IDatacenterAuthBaseDeleteOptions<T> extends ISequelizeDeleteOptions<T> {
  baseDCenterApiUrl: string,
  authToken: string,
  user: IUserSharedData,
  skipAuthorization: boolean
}