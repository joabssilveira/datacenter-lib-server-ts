/*
* O PACOTE DATACENTER-LIB-SERVER-TS E DATACENTER-LIB-DAO-TS TEM A MESMA LOGICA NESSE ARQUIVO
* A DIFERENCA ENTRE ELES É QUE O SERVER USA A API DO DATACENTER PRA OBTER OS DADOS 
* ENQUANTO QUE O DAO VAI DIRETO NO BANCO DO DATACENTER
* O SERVER DEVE SER USADO POR APIS SATELITES AO DATACENTER 
* O DAO É USADO PELA PROPRIA API DO DATACENTER
* QUALQUER ALTERACAO AQUI DEVE SER REPLICADA LA
*/

import { IDbGetResult, SequelizeDataSource, ISequelizeRelationBelongsTo, ISequelizeRelationHasMany, ISequelizeRelationHasOne, SequelizeTransaction, WithoutSequelizeTimestamps } from 'fwork-jsts-db';
import { ModelDefined } from 'sequelize';
import { getAuthorizationAttOptions } from './authorizationTypes';
import { IDatacenterAuthBaseBulkCreateOptions, IDatacenterAuthBaseCreateOptions, IDatacenterAuthBaseDeleteByKeyOptions, 
  IDatacenterAuthBaseDeleteOptions, IDatacenterAuthBaseGetOptions, IDatacenterAuthBaseUpdateOptions } from './crudOptions';
import { DatacenterCrudAuthTypes } from 'datacenter-lib-common-ts';

export abstract class DatacenterAuthBaseDataSource<T extends object, ModelType> extends SequelizeDataSource<T> {
  models: ModelType

  constructor(options: {
    models: ModelType,
    collectionModel: ModelDefined<T, T | WithoutSequelizeTimestamps<T>>,
    keyName: keyof T,
    transaction?: SequelizeTransaction | undefined,
    belongsTo?: ISequelizeRelationBelongsTo<any, any>[] | undefined
    hasMany?: ISequelizeRelationHasMany<any, any>[] | undefined
    hasOne?: ISequelizeRelationHasOne<any, any>[] | undefined
  }) {
    super(options)
    this.models = options.models
  }

  onBeforeBulkCreate(options: IDatacenterAuthBaseBulkCreateOptions<T>): IDatacenterAuthBaseBulkCreateOptions<T> | Promise<IDatacenterAuthBaseBulkCreateOptions<T>> {
    return super.onBeforeBulkCreate(options) as any
  }
  onAfterBulkCreate(options: IDatacenterAuthBaseBulkCreateOptions<T>, createdList?: T[] | undefined): void | Promise<void> {
    super.onAfterBulkCreate(options, createdList)
  }
  onBeforeCreate(options: IDatacenterAuthBaseCreateOptions<T>): IDatacenterAuthBaseCreateOptions<T> | Promise<IDatacenterAuthBaseCreateOptions<T>> {
    return super.onBeforeCreate(options) as any
  }
  onAfterCreate(options: IDatacenterAuthBaseCreateOptions<T>, created?: T | undefined): void | Promise<void> {
    super.onAfterCreate(options, created)
  }
  onBeforeRead(options: IDatacenterAuthBaseGetOptions<T>): IDatacenterAuthBaseGetOptions<T> | Promise<IDatacenterAuthBaseGetOptions<T> | undefined> | undefined {
    return super.onBeforeRead(options) as any
  }
  onAfterRead(options: IDatacenterAuthBaseGetOptions<T> | undefined, result?: IDbGetResult<T[]> | undefined): void | Promise<void> {
    super.onAfterRead(options, result)
  }
  onBeforeUpdate(options: IDatacenterAuthBaseUpdateOptions<T>): IDatacenterAuthBaseUpdateOptions<T> | Promise<IDatacenterAuthBaseUpdateOptions<T>> {
    return super.onBeforeUpdate(options) as any
  }
  onAfterUpdate(options: IDatacenterAuthBaseUpdateOptions<T>, result?: { modifiedCount: number } | undefined): void | Promise<void> {
    super.onAfterUpdate(options, result)
  }
  onBeforeDelete(options: IDatacenterAuthBaseDeleteOptions<T> | IDatacenterAuthBaseDeleteByKeyOptions<any>): IDatacenterAuthBaseDeleteOptions<T> | IDatacenterAuthBaseDeleteByKeyOptions<any> | Promise<IDatacenterAuthBaseDeleteOptions<T> | IDatacenterAuthBaseDeleteByKeyOptions<any>> {
    return super.onBeforeDelete(options) as any
  }
  onAfterDelete(options: IDatacenterAuthBaseDeleteOptions<T> | IDatacenterAuthBaseDeleteByKeyOptions<any>, result: number): void | Promise<void> {
    super.onAfterDelete(options, result)
  }

  overrideCreateMasterOptions(options: IDatacenterAuthBaseCreateOptions<any>) {
    return super.overrideCreateMasterOptions(options)
  }
  overrideCreateChildrenOptions(options: IDatacenterAuthBaseCreateOptions<any>) {
    options.crudAuth = {
      type: DatacenterCrudAuthTypes.skip,
    }
    return super.overrideCreateChildrenOptions(options)
  }
  overrideCreateChildOptions(options: IDatacenterAuthBaseCreateOptions<any>) {
    options.crudAuth = {
      type: DatacenterCrudAuthTypes.skip,
    }
    return super.overrideCreateChildOptions(options)
  }

  overrideBulkCreateMasterOptions(options: IDatacenterAuthBaseBulkCreateOptions<any>) {
    return super.overrideBulkCreateMasterOptions(options)
  }
  overrideBulkCreateChildrenOptions(options: IDatacenterAuthBaseBulkCreateOptions<any>) {
    options.crudAuth = {
      type: DatacenterCrudAuthTypes.skip,
    }
    return super.overrideBulkCreateChildrenOptions(options)
  }
  overrideBulkCreateChildOptions(options: IDatacenterAuthBaseBulkCreateOptions<any>) {
    options.crudAuth = {
      type: DatacenterCrudAuthTypes.skip,
    }
    return super.overrideBulkCreateChildOptions(options)
  }

  async bulkCreate(options: IDatacenterAuthBaseBulkCreateOptions<T>): Promise<T[] | undefined> {
    if (options.crudAuth.type != DatacenterCrudAuthTypes.skip) {
      if (!options.baseDCenterApiUrl || !options.authToken)
        throw Error('Acesso negado!')

      const authOpt = getAuthorizationAttOptions(this)
      if (authOpt?.checkBulkCreate) {
        if (!await authOpt?.checkBulkCreate(options, this)) {
          throw Error('Acesso negado')
        }
      }
    }
    return super.bulkCreate(options)
  }

  async create(options: IDatacenterAuthBaseCreateOptions<T>): Promise<T | undefined> {
    if (options.crudAuth.type != DatacenterCrudAuthTypes.skip) {
      if (!options.baseDCenterApiUrl || !options.authToken)
        throw Error('Acesso negado!')

      const authOpt = getAuthorizationAttOptions(this)
      if (authOpt?.checkCreate) {
        if (!await authOpt?.checkCreate(options, this)) {
          throw Error('Acesso negado')
        }
      }
    }
    return super.create(options)
  }

  async read(options: IDatacenterAuthBaseGetOptions<T>): Promise<IDbGetResult<T[]> | undefined> {
    if (options.crudAuth.type != DatacenterCrudAuthTypes.skip) {
      if (!options.baseDCenterApiUrl || !options.authToken)
        throw Error('Acesso negado!')

      const authOpt = getAuthorizationAttOptions(this)
      if (authOpt?.checkRead) {
        if (!await authOpt?.checkRead(options, this)) {
          throw Error('Acesso negado')
        }
      }
    }
    return super.read(options)
  }

  async update(options: IDatacenterAuthBaseUpdateOptions<T>): Promise<T | undefined> {
    if (options.crudAuth.type != DatacenterCrudAuthTypes.skip) {
      if (!options.baseDCenterApiUrl || !options.authToken)
        throw Error('Acesso negado!')

      const authOpt = getAuthorizationAttOptions(this)
      if (authOpt?.checkUpdate) {
        if (!await authOpt?.checkUpdate(options, this)) {
          throw Error('Acesso negado')
        }
      }
    }
    return super.update(options)
  }

  // removida a possibilidade de apagar com where, apenas pela key sera permitido
  // isso porque ainda nao tem como checar autorizacao com where
  // async delete(options: IDbDatacenterDeleteByKeyOptions<any> | IDbDatacenterDeleteOptions<T>): Promise<number> {
  async delete(options: IDatacenterAuthBaseDeleteByKeyOptions<any>): Promise<number> {
    if (options.crudAuth.type != DatacenterCrudAuthTypes.skip) {
      if (!options.baseDCenterApiUrl || !options.authToken)
        throw Error('Acesso negado!')
      
      const authOpt = getAuthorizationAttOptions(this)
      if (authOpt?.checkDelete) {
        if (!await authOpt?.checkDelete(options, this)) {
          throw Error('Acesso negado')
        }
      }
    }
    return super.delete(options)
  }
}