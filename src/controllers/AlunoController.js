const alunoService = require("../services/AlunoService");

class AlunoController{
    
    async findMany(request, response){
        let {page, pageSize, orderBy, order, tipoOrdenacao} = request.query;
        page ||= 1;
        pageSize ||= 10;

        try{
            const {alunos, total} = await alunoService.findMany(
                page, pageSize, orderBy, order || tipoOrdenacao
            );
            return response.status(200).json({alunos, total});
        }catch(error){
            return response.status(error.statusCode || 500).json({error: error.message});
        }
    }

    async create(request, response){
        try{
            const aluno = await alunoService.create(request.body);
            return response.status(201).json({aluno});
        }catch(error){
            return response.status(400).json({error: error.message});
        }
    }

}

module.exports = new AlunoController();
