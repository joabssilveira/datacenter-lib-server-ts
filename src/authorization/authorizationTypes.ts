import { DatacenterAuthBaseDataSource } from './authBaseDatasource';
import { IDatacenterAuthBaseBulkCreateOptions, IDatacenterAuthBaseCreateOptions, IDatacenterAuthBaseDeleteByKeyOptions, 
  IDatacenterAuthBaseGetOptions, IDatacenterAuthBaseUpdateOptions } from './crudOptions';

export interface IAuthorizationAttOptions<T extends object, ModelType> {
  checkBulkCreate?: (options: IDatacenterAuthBaseBulkCreateOptions<T>, ds: DatacenterAuthBaseDataSource<T, ModelType>) => Promise<boolean | undefined> | boolean | undefined
  checkCreate?: (options: IDatacenterAuthBaseCreateOptions<T>, ds: DatacenterAuthBaseDataSource<T, ModelType>) => Promise<boolean | undefined> | boolean | undefined
  checkRead?: (options: IDatacenterAuthBaseGetOptions<T>, ds: DatacenterAuthBaseDataSource<T, ModelType>) => Promise<boolean | undefined> | boolean | undefined
  checkUpdate?: (options: IDatacenterAuthBaseUpdateOptions<T>, ds: DatacenterAuthBaseDataSource<T, ModelType>) => Promise<boolean | undefined> | boolean | undefined
  // removida a possibilidade de apagar com where, apenas pela key sera permitido
  // isso porque ainda nao tem como checar autorizacao com where
  // checkDelete?: (options: IDbDatacenterDeleteByKeyOptions<any> | IDbDatacenterDeleteOptions<T>) => Promise<boolean | undefined> | boolean | undefined
  checkDelete?: (options: IDatacenterAuthBaseDeleteByKeyOptions<any>, ds: DatacenterAuthBaseDataSource<T, ModelType>) => Promise<boolean | undefined> | boolean | undefined
}

// attribute
export const authorizationAtt = <T extends object, ModelType>(value: IAuthorizationAttOptions<T, ModelType>) => (target: any) => {
  target.prototype.__att = value;
  return target;
}

// get authorization attribute options from instance
export function getAuthorizationAttOptions(instance: any): IAuthorizationAttOptions<any, any> | undefined {
  return instance.__att as IAuthorizationAttOptions<any, any> | undefined;
}