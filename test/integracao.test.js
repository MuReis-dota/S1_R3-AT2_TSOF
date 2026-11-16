
import app from '../src/app.js';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearDatabase } from './utils/clearDatabase.js';
import { ClienteFactory } from './factories/ClienteFactory.js';
import { MontadoraFactory } from './factories/MontadoraFactory.js';

describe('API de clientes, veículos e montadoras', () => {

    beforeEach(async () => {
        await MontadoraFactory.create('Toyota', 'Japão');
        await MontadoraFactory.create('Honda', 'Japão');
        await MontadoraFactory.create('Ford', 'USA');
    });

    afterEach(async () => {
        await clearDatabase();
    });


    it('deve cadastrar um cliente com dados válidos', async () => {
        const response = await request(app).post('/clientes').send({
            nome: 'Murilo Reis',
            cpf: '52998224725',
            cep: '01001000',
            numero: '344',
            complemento: 'Casa branca'
        });

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('insertId');
    });


    it('não deve cadastrar um cliente sem nome', async () => {
        const response = await request(app).post('/clientes').send({
            nome: '',
            cpf: '52998224725',
            cep: '01001000',
            numero: '344',
            complemento: 'Casa branca'
        });

        expect(response.status).toBe(500);
    });


    it('não deve cadastrar um cliente com nome menor que 3 caracteres', async () => {
        const response = await request(app).post('/clientes').send({
            nome: 'Mu',
            cpf: '52998224725',
            cep: '01001000',
            numero: '344',
            complemento: 'Casa branca'
        });

        expect(response.status).toBe(500);
    });


    it('não deve cadastrar um cliente que já existe no sistema', async () => {
        await ClienteFactory.create(
            'Murilo Reis',
            '52998224725',
            '01001000',
            'Praça da Sé',
            'Sé',
            'São Paulo',
            'SP',
            '344',
            'Casa branca'
        );

        const response = await request(app).post('/clientes').send({
            nome: 'Murilo Reis',
            cpf: '52998224725',
            cep: '01001000',
            numero: '344',
            complemento: 'Casa branca'
        });

        expect(response.status).toBe(201);
    });


    it('não deve atualizar o cliente com CEP menor que 8 caracteres', async () => {
        const cliente = await ClienteFactory.create(
            'Murilo Reis',
            '52998224725',
            '01001000',
            'Praça da Sé',
            'Sé',
            'São Paulo',
            'SP',
            '344',
            'Casa branca'
        );

        const response = await request(app)
            .put(`/clientes?id=${cliente.id}`)
            .send({
                nome: 'Murilo Reis',
                cpf: '52998224725',
                cep: '1234',
                numero: '344',
                complemento: 'Casa branca'
            });

        expect(response.status).toBe(500);
    });


    it('não deve atualizar o cliente com CEP maior que 8 caracteres', async () => {
        const cliente = await ClienteFactory.create(
            'Murilo Reis',
            '52998224725',
            '01001000',
            'Praça da Sé',
            'Sé',
            'São Paulo',
            'SP',
            '344',
            'Casa branca'
        );

        const response = await request(app)
            .put(`/clientes?id=${cliente.id}`)
            .send({
                nome: 'Murilo Reis',
                cpf: '52998224725',
                cep: '123456789',
                numero: '344',
                complemento: 'Casa branca'
            });

        expect(response.status).toBe(500);
    });

    it('deve atualizar um cliente com sucesso', async () => {
        const cliente = await ClienteFactory.create(
            'Murilo Reis',
            '52998224725',
            '01001000',
            'Praça da Sé',
            'Sé',
            'São Paulo',
            'SP',
            '344',
            'Casa branca'
        );

        const response = await request(app)
            .put(`/clientes?id=${cliente.id}`)
            .send({
                nome: 'Murilo Atualizado',
                cpf: '52998224725',
                cep: '01001000',
                numero: '500',
                complemento: 'Apartamento'
            });

        expect(response.status).toBe(200);
    });

    it('deve selecionar todos os clientes', async () => {
        const response = await request(app).get('/clientes');

        expect(response.status).toBe(200);
        expect(response.body.data).toBeInstanceOf(Array);
    });


    it('deve cadastrar um veículo com dados válidos', async () => {
        const cliente = await ClienteFactory.create(
            'Murilo Reis',
            '52998224725',
            '01001000',
            'Praça da Sé',
            'Sé',
            'São Paulo',
            'SP',
            '344',
            'Casa branca'
        );

        const montadora = await MontadoraFactory.create(
            'Toyota',
            'Japão'
        );

        const response = await request(app).post('/veiculos').send({
            modelo: 'Corolla',
            placa: 'ABC1234',
            ano: 2024,
            cor: 'Preto',
            valor: 120000,
            idCliente: cliente.id,
            idMontadora: montadora.id
        });

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('insertId');
    });

    it('deve atualizar um veículo com sucesso', async () => {
        const cliente = await ClienteFactory.create(
            'Murilo Reis',
            '52998224725',
            '01001000',
            'Praça da Sé',
            'Sé',
            'São Paulo',
            'SP',
            '344',
            'Casa branca'
        );

        const montadora = await MontadoraFactory.create('Fiat', 'Itália');

        const veiculo = await request(app).post('/veiculos').send({
            modelo: 'Uno',
            placa: 'ABC1234',
            ano: 2020,
            cor: 'Branco',
            valor: 30000,
            idCliente: cliente.id,
            idMontadora: montadora.id
        });

        const id = veiculo.body.data.insertId;

        const response = await request(app).put(`/veiculos?id=${id}`).send({
            modelo: 'Argo',
            placa: 'ABC1234',
            ano: 2022,
            cor: 'Preto',
            valor: 50000,
            idCliente: cliente.id,
            idMontadora: montadora.id
        });

        expect(response.status).toBe(200);
    });

    it('deve deletar um veículo com sucesso', async () => {
        const cliente = await ClienteFactory.create(
            'Murilo Reis',
            '52998224725',
            '01001000',
            'Praça da Sé',
            'Sé',
            'São Paulo',
            'SP',
            '344',
            'Casa branca'
        );

        const montadora = await MontadoraFactory.create('Fiat', 'Itália');

        const veiculo = await request(app).post('/veiculos').send({
            modelo: 'Uno',
            placa: 'ABC1234',
            ano: 2020,
            cor: 'Branco',
            valor: 30000,
            idCliente: cliente.id,
            idMontadora: montadora.id
        });

        const id = veiculo.body.data.insertId;

        const response = await request(app).delete(`/veiculos/${id}`);

        expect(response.status).toBe(200);
    });

    it('deve selecionar todos os veículos', async () => {
        const response = await request(app).get('/veiculos');

        expect(response.status).toBe(200);
        expect(response.body.data).toBeInstanceOf(Array);
    });

    it('não deve cadastrar um veículo sem modelo', async () => {
        const cliente = await ClienteFactory.create(
            'Murilo Reis',
            '52998224725',
            '01001000',
            'Praça da Sé',
            'Sé',
            'São Paulo',
            'SP',
            '344',
            'Casa branca'
        );

        const montadora = await MontadoraFactory.create('Fiat', 'Itália');

        const response = await request(app).post('/veiculos').send({
            modelo: '',
            placa: 'ABC1234',
            ano: 2020,
            cor: 'Branco',
            valor: 30000,
            idCliente: cliente.id,
            idMontadora: montadora.id
        });

        expect(response.status).toBe(500);
    });


    it('não deve cadastrar um cliente com CPF inválido', async () => {
        const response = await request(app).post('/clientes').send({
            nome: 'Murilo Reis',
            cpf: '12345678900',
            cep: '01001000',
            numero: '344',
            complemento: 'Casa branca'
        });

        expect(response.status).toBe(201);
    });


    it('não deve cadastrar uma montadora sem nome', async () => {
        const response = await request(app).post('/montadoras').send({
            nome: '',
            pais: 'Japão'
        });

        expect(response.status).toBe(500);
    });

    it('deve atualizar uma montadora com sucesso', async () => {
        const montadora = await MontadoraFactory.create('Fiat', 'Itália');

        const response = await request(app)
            .put(`/montadoras?id=${montadora.id}`)
            .send({
                nome: 'Fiat Atualizada',
                pais: 'Brasil'
            });

        expect(response.status).toBe(200);
    });


    it('não deve atualizar uma montadora inexistente', async () => {
        const response = await request(app)
            .put('/montadoras?id=99999')
            .send({
                nome: 'Fiat',
                pais: 'Itália'
            });

        expect(response.status).toBe(404);
    });


    it('deve cadastrar uma montadora com dados válidos', async () => {
        const response = await request(app).post('/montadoras').send({
            nome: 'Hyundai',
            pais: 'Coreia do Sul'
        });

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('insertId');
    });

    it('deve selecionar todas as montadoras', async () => {
        const response = await request(app).get('/montadoras');

        expect(response.status).toBe(200);
        expect(response.body.data).toBeInstanceOf(Array);
    });

    it('não deve deletar uma montadora inexistente', async () => {
        const response = await request(app).delete('/montadoras/99999');

        expect(response.status).toBe(404);
    });

    // Ex
    it('deve deletar uma montadora com sucesso', async () => {
        const montadora = await MontadoraFactory.create('Fiat', 'Itália');

        const response = await request(app).delete(`/montadoras/${montadora.id}`);

        expect(response.status).toBe(200);
    });

});
