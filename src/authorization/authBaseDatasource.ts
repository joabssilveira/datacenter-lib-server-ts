import { IDbGetResult, SequelizeDataSource, ISequelizeRelationBelongsTo, ISequelizeRelationHasMany, ISequelizeRelationHasOne, SequelizeTransaction } from 'fwork-jsts-db';
import { ModelDefined } from 'sequelize';
import { getAuthorizationAttOptions } from './authorizationTypes';
import { IDatacenterAuthBaseBulkCreateOptions, IDatacenterAuthBaseCreateOptions, IDatacenterAuthBaseDeleteByKeyOptions, 
  IDatacenterAuthBaseDeleteOptions, IDatacenterAuthBaseGetOptions, IDatacenterAuthBaseUpdateOptions } from './crudOptions';

export abstract class DatacenterAuthBaseDataSource<T extends object, ModelType> extends SequelizeDataSource<T> {
  models: ModelType

  constructor(options: {
    models: ModelType,
    collectionModel: ModelDefined<T, T>,
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
    return options
  }
  onAfterBulkCreate(_options: IDatacenterAuthBaseBulkCreateOptions<T>, _createdList?: T[] | undefined): void | Promise<void> {

  }
  onBeforeCreate(options: IDatacenterAuthBaseCreateOptions<T>): IDatacenterAuthBaseCreateOptions<T> | Promise<IDatacenterAuthBaseCreateOptions<T>> {
    return options
  }
  onAfterCreate(_options: IDatacenterAuthBaseCreateOptions<T>, _created?: T | undefined): void | Promise<void> {

  }
  onBeforeRead(options: IDatacenterAuthBaseGetOptions<T>): IDatacenterAuthBaseGetOptions<T> | Promise<IDatacenterAuthBaseGetOptions<T> | undefined> | undefined {
    return options
  }
  onAfterRead(_options: IDatacenterAuthBaseGetOptions<T> | undefined, _result?: IDbGetResult<T[]> | undefined): void | Promise<void> {

  }
  onBeforeUpdate(options: IDatacenterAuthBaseUpdateOptions<T>): IDatacenterAuthBaseUpdateOptions<T> | Promise<IDatacenterAuthBaseUpdateOptions<T>> {
    return options
  }
  onAfterUpdate(_options: IDatacenterAuthBaseUpdateOptions<T>, _result?: { modifiedCount: number } | undefined): void | Promise<void> {

  }
  onBeforeDelete(options: IDatacenterAuthBaseDeleteOptions<T> | IDatacenterAuthBaseDeleteByKeyOptions<any>): IDatacenterAuthBaseDeleteOptions<T> | IDatacenterAuthBaseDeleteByKeyOptions<any> | Promise<IDatacenterAuthBaseDeleteOptions<T> | IDatacenterAuthBaseDeleteByKeyOptions<any>> {
    return options
  }
  onAfterDelete(_options: IDatacenterAuthBaseDeleteOptions<T> | IDatacenterAuthBaseDeleteByKeyOptions<any>, _result: number): void | Promise<void> {

  }

  overrideCreateMasterOptions(options: IDatacenterAuthBaseCreateOptions<any>) {
    return super.overrideCreateMasterOptions(options)
  }
  overrideCreateChildrenOptions(options: IDatacenterAuthBaseCreateOptions<any>) {
    options.skipAuthorization = true
    return super.overrideCreateChildrenOptions(options)
  }
  overrideCreateChildOptions(options: IDatacenterAuthBaseCreateOptions<any>) {
    options.skipAuthorization = true
    return super.overrideCreateChildOptions(options)
  }

  overrideBulkCreateMasterOptions(options: IDatacenterAuthBaseBulkCreateOptions<any>) {
    return super.overrideBulkCreateMasterOptions(options)
  }
  overrideBulkCreateChildrenOptions(options: IDatacenterAuthBaseBulkCreateOptions<any>) {
    options.skipAuthorization = true
    return super.overrideBulkCreateChildrenOptions(options)
  }
  overrideBulkCreateChildOptions(options: IDatacenterAuthBaseBulkCreateOptions<any>) {
    options.skipAuthorization = true
    return super.overrideBulkCreateChildOptions(options)
  }

  async bulkCreate(options: IDatacenterAuthBaseBulkCreateOptions<T>): Promise<T[] | undefined> {
    if (!options.skipAuthorization) {
      const authOpt = getAuthorizationAttOptions(this)
      if (authOpt?.checkBulkCreate) {
        if (!await authOpt?.checkBulkCreate(options, this)) {
          console.log(`Acesso negado (${this.collectionModel.tableName})`)
          throw Error('Acesso negado')
        }
      }
    }
    return super.bulkCreate(options)
  }

  async create(options: IDatacenterAuthBaseCreateOptions<T>): Promise<T | undefined> {
    if (!options.skipAuthorization) {
      const authOpt = getAuthorizationAttOptions(this)
      if (authOpt?.checkCreate) {
        if (!await authOpt?.checkCreate(options, this)) {
          console.log(`Acesso negado (${this.collectionModel.tableName})`)
          throw Error('Acesso negado')
        }
      }
    }
    return super.create(options)
  }

  async read(options: IDatacenterAuthBaseGetOptions<T>): Promise<IDbGetResult<T[]> | undefined> {
    if (!options.skipAuthorization) {
      const authOpt = getAuthorizationAttOptions(this)
      if (authOpt?.checkRead) {
        if (!await authOpt?.checkRead(options, this)) {
          console.log(`Acesso negado (${this.collectionModel.tableName})`)
          throw Error('Acesso negado')
        }
      }
    }
    return super.read(options)
  }

  async update(options: IDatacenterAuthBaseUpdateOptions<T>): Promise<T | undefined> {
    if (!options.skipAuthorization) {
      const authOpt = getAuthorizationAttOptions(this)
      if (authOpt?.checkUpdate) {
        if (!await authOpt?.checkUpdate(options, this)) {
          console.log(`Acesso negado (${this.collectionModel.tableName})`)
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
    if (!options.skipAuthorization) {
      const authOpt = getAuthorizationAttOptions(this)
      if (authOpt?.checkDelete) {
        if (!await authOpt?.checkDelete(options, this)) {
          console.log(`Acesso negado (${this.collectionModel.tableName})`)
          throw Error('Acesso negado')
        }
      }
    }
    return super.delete(options)
  }
}