import { Request, Response } from 'express'
import { getCustomRepository } from 'typeorm'
import { UsersRepository } from '../repositories/UsersRepository'
import * as yup from 'yup'
import { AppError } from '../errors/AppError'

class UserController {

    async getAll(req: Request, res: Response) {
        const usersRepository = getCustomRepository(UsersRepository)
        const users = await usersRepository.find({})

        res.status(200).json(users)
    }

    async create(req: Request, res: Response) {
        const { name, email } = req.body

        const schema = yup.object().shape({
            name: yup.string().required('Nome é obrigatório!'),
            email: yup.string().email('Email inválido!').required('Email é obrigatório!')
        })

        /*
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({error: 'Validation failed!'})
        }
        */

        try
        {
            await schema.validate(req.body, {abortEarly: false})
        }
        catch(err){
            throw new AppError(err)
        }

        const usersRepository = getCustomRepository(UsersRepository)

        const userAlreadyExists = await usersRepository.findOne({
            email
        })

        if (userAlreadyExists) {
            throw new AppError('User already exists')
        }

        const user = usersRepository.create({
            name, email
        })

        await usersRepository.save(user)

        return res.status(201).json(user)
    }

}

export { UserController }
