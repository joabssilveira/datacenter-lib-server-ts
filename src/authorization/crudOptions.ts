/*
* O PACOTE DATACENTER-LIB-SERVER-TS E DATACENTER-LIB-DAO-TS TEM A MESMA LOGICA NESSE ARQUIVO
* A DIFERENCA ENTRE ELES É QUE O SERVER USA A API DO DATACENTER PRA OBTER OS DADOS 
* ENQUANTO QUE O DAO VAI DIRETO NO BANCO DO DATACENTER
* O SERVER DEVE SER USADO POR APIS SATELITES AO DATACENTER 
* O DAO É USADO PELA PROPRIA API DO DATACENTER
* QUALQUER ALTERACAO AQUI DEVE SER REPLICADA LA
*/

import { DatacenterCrudAuth } from "datacenter-lib-common-ts"
import {
  ISequelizeBulkCreateOptions, ISequelizeCreateOptions, ISequelizeDeleteByKeyOptions, ISequelizeDeleteOptions,
  ISequelizeGetOptions, ISequelizeUpdateOptions
} from "fwork-jsts-db"

export interface IDatacenterAuthBaseBulkCreateOptions<T> extends ISequelizeBulkCreateOptions<T> {
  baseDCenterApiUrl: string,
  authToken: string,
  crudAuth: DatacenterCrudAuth
}

export interface IDatacenterAuthBaseCreateOptions<T> extends ISequelizeCreateOptions<T> {
  baseDCenterApiUrl: string,
  authToken: string,
  crudAuth: DatacenterCrudAuth
}

export interface IDatacenterAuthBaseGetOptions<T> extends ISequelizeGetOptions<T> {
  baseDCenterApiUrl: string,
  authToken: string,
  crudAuth: DatacenterCrudAuth
}

export interface IDatacenterAuthBaseUpdateOptions<T> extends ISequelizeUpdateOptions<T> {
  baseDCenterApiUrl: string,
  authToken: string,
  crudAuth: DatacenterCrudAuth
}

export interface IDatacenterAuthBaseDeleteByKeyOptions<T> extends ISequelizeDeleteByKeyOptions<T> {
  baseDCenterApiUrl: string,
  authToken: string,
  crudAuth: DatacenterCrudAuth
}

export interface IDatacenterAuthBaseDeleteOptions<T> extends ISequelizeDeleteOptions<T> {
  baseDCenterApiUrl: string,
  authToken: string,
  crudAuth: DatacenterCrudAuth
}