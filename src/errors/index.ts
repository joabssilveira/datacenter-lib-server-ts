import { AuthenticationError, AuthorizationError } from "datacenter-lib-common-ts"
import { NotFoundError } from "datacenter-lib-common-ts/src/errors"
import { Response } from 'express'
import { ValidationError } from "sequelize"

export function getError(options: {
  res: Response, error: any,
}) {
  const { res, error, } = options

  if (error instanceof AuthenticationError)
    return res.status(401).send(error.message)

  if (error instanceof AuthorizationError)
    return res.status(403).send(error.message)

  if (error instanceof NotFoundError)
    return res.status(404).send(error.message)

  if (error instanceof ValidationError)
    return res.status(409).send(error.message ?? error)

  return res.status(500).send(error.message ?? error)
}