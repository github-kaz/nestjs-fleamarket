import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../types/jwtPayload';
import { CredentialsDto } from './dto/credentials.dto';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const { name, email, password, status } = createUserDto;
        const hashedPassword = await bcrypt.hash(password, 10);
        return await this.prismaService.user.create({
            data: { name, email, password: hashedPassword, status },
        });
    }

    async signIn(credentialsDto: CredentialsDto): Promise<{ accessToken: string }> {
        const { email, password } = credentialsDto;
        const user = await this.prismaService.user.findUnique({
            where: { email },
        });
        if (user && await bcrypt.compare(password, user.password)) {
            const payload: JwtPayload = {
                sub: user.id,
                username: user.name,
                status: user.status,
            };
            const accessToken = this.jwtService.sign(payload);
            return { accessToken };
        }

        throw new UnauthorizedException('Invalid email or password');
    }
}
