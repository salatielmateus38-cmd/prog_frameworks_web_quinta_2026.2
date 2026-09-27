const prisma = require("../databases/prisma");
const AlunoInvalidoError = require("../errors/AlunoInvalidoError");
const AlunoNaoEncontradoError = require("../errors/AlunoNaoEncontradoError");
const EmailDuplicadoError = require("../errors/EmailDuplicadoError");
const alunoSchema = require("../schemas/alunoSchema");

class AlunoService{

    async findMany(page, pageSize, orderBy = "id", order = "asc"){
        const camposOrdenaveis = ["id", "nome", "email", "createdAt", "updatedAt"];
        const campo = camposOrdenaveis.includes(orderBy) ? orderBy : "id";
        const direcao = ["asc", "desc"].includes(order) ? order : "asc";

        const [alunos, total] = await Promise.all([
            prisma.aluno.findMany({
                skip: (page-1)*pageSize,
                take: Number(pageSize),
                orderBy: {[campo]: direcao}
            }),
            prisma.aluno.count()
        ]);
        return {alunos, total};
    }

    async findUnique(id){
        if(!Number.isInteger(id) || id <= 0){
            throw new AlunoInvalidoError("Id de aluno inválido");
        }

        const aluno = await prisma.aluno.findUnique({where: {id}});
        if(!aluno){
            throw new AlunoNaoEncontradoError();
        }
        return aluno;
    }

    async update(id, dados){
        const resultado = alunoSchema.partial().safeParse(dados);
        if(!resultado.success || Object.keys(resultado.data).length === 0){
            // Reutiliza AlunoInvalidoError: dados ausentes ou inválidos têm o mesmo status 400 do cadastro.
            throw new AlunoInvalidoError("Informe nome e/ou email válidos para atualizar");
        }

        await this.findUnique(id);
        try{
            return await prisma.aluno.update({
                where: {id},
                data: resultado.data
            });
        }catch(error){
            if(error.code === "P2025"){
                throw new AlunoNaoEncontradoError();
            }
            if(error.code === "P2002"){
                // EmailDuplicadoError distingue o conflito de unicidade (409) da validação de entrada (400).
                throw new EmailDuplicadoError();
            }
            throw error;
        }
    }

    async delete(id){
        await this.findUnique(id);
        try{
            await prisma.aluno.delete({where: {id}});
        }catch(error){
            if(error.code === "P2025"){
                throw new AlunoNaoEncontradoError();
            }
            throw error;
        }
    }

    async create(aluno){
        const {nome, email} = aluno;
        if(!nome || !email){
            throw new AlunoInvalidoError();
        }

        const novoAluno = await prisma.aluno.create({data: aluno});

        return novoAluno;
    }
}

module.exports = new AlunoService();
