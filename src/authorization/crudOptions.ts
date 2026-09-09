import { DatacenterCrudAuth } from "datacenter-lib-common-ts"
import {
  ISequelizeBulkCreateOptions, ISequelizeCreateOptions, ISequelizeDeleteByKeyOptions, ISequelizeDeleteOptions,
  ISequelizeGetOptions, ISequelizeUpdateOptions
} from "fwork-jsts-db"

export interface IDatacenterAuthBaseBulkCreateOptions<T> extends ISequelizeBulkCreateOptions<T> {
  // baseDCenterApiUrl: string | undefined,
  // authToken: string | undefined,
  baseDCenterApiUrl: string,
  authToken: string,
  crudAuth: DatacenterCrudAuth
}

export interface IDatacenterAuthBaseCreateOptions<T> extends ISequelizeCreateOptions<T> {
  // baseDCenterApiUrl: string | undefined,
  // authToken: string | undefined,
  baseDCenterApiUrl: string,
  authToken: string,
  crudAuth: DatacenterCrudAuth
}

export interface IDatacenterAuthBaseGetOptions<T> extends ISequelizeGetOptions<T> {
  // baseDCenterApiUrl: string | undefined,
  // authToken: string | undefined,
  baseDCenterApiUrl: string,
  authToken: string,
  crudAuth: DatacenterCrudAuth
}

export interface IDatacenterAuthBaseUpdateOptions<T> extends ISequelizeUpdateOptions<T> {
  // baseDCenterApiUrl: string | undefined,
  // authToken: string | undefined,
  baseDCenterApiUrl: string,
  authToken: string,
  crudAuth: DatacenterCrudAuth
}

export interface IDatacenterAuthBaseDeleteByKeyOptions<T> extends ISequelizeDeleteByKeyOptions<T> {
  // baseDCenterApiUrl: string | undefined,
  // authToken: string | undefined,
  baseDCenterApiUrl: string,
  authToken: string,
  crudAuth: DatacenterCrudAuth
}

export interface IDatacenterAuthBaseDeleteOptions<T> extends ISequelizeDeleteOptions<T> {
  // baseDCenterApiUrl: string | undefined,
  // authToken: string | undefined,
  baseDCenterApiUrl: string,
  authToken: string,
  crudAuth: DatacenterCrudAuth
}