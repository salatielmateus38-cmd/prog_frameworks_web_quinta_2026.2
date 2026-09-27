const prisma = require("../databases/prisma");
const AlunoInvalidoError = require("../errors/AlunoInvalidoError");

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
