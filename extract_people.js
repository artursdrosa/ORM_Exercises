const { Sequelize, DataTypes, Op } = require('sequelize');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const readline = require('readline');

const MYSQL_IP = "localhost";
const MYSQL_LOGIN = "root";
const MYSQL_PASSWORD = "root";
const DATABASE = "db2_m1";

const sequelize = new Sequelize(DATABASE, MYSQL_LOGIN, MYSQL_PASSWORD, {
    host: MYSQL_IP,
    dialect: "mysql"
});

const Person = sequelize.define('Person', {
    index: { type: DataTypes.INTEGER, primaryKey: true },
    userId: { type: DataTypes.STRING },
    firstName: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING },
    sex: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    dateOfBirth: { type: DataTypes.DATEONLY },
    jobTitle: { type: DataTypes.STRING },
}, {
    tableName: 'people',
    timestamps: false,
});

async function extractAndInsertData(filePath, sequelize, model) {
    try {
        await sequelize.sync();

        // Foi realizada a leitura e parsing do arquivo CSV
        const csvData = fs.readFileSync(filePath, 'utf8');
        const rows = parse(csvData, { columns: true, skip_empty_lines: true });

        const people = rows.map(row => ({
            index: parseInt(row.Index, 10),
            userId: row['User Id'],
            firstName: row['First Name'],
            lastName: row['Last Name'],
            sex: row.Sex,
            email: row.Email,
            phone: row.Phone,
            dateOfBirth: row['Date of birth'],
            jobTitle: row['Job Title'],
        }));

        await model.bulkCreate(people, { validate: true });
        console.log('Inserção realizada com sucesso.');
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function displayData(model) {
    try {
        // Foram lidos todos os registros da tabela 'people'
        const people = await model.findAll();
        console.table(people.map(person => person.toJSON()));
    } catch (error) {
        console.error('Erro ao exibir os dados:', error);
    }
}

async function filterByName(nameTerm, model) {
    try {
        // Foram filtrados os registros onde firstName ou lastName atendem ao critério LIKE %nameTerm%
        const filteredPeople = await model.findAll({
            where: {
                [Op.or]: [
                    { firstName: { [Op.like]: `%${nameTerm}%` } },
                    { lastName: { [Op.like]: `%${nameTerm}%` } }
                ]
            }
        });
        console.table(filteredPeople.map(person => person.toJSON()));
    } catch (error) {
        console.error('Erro ao filtrar os dados:', error);
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => {
        rl.question(query, answer => {
            resolve(answer);
        });
    });
}

async function main() {
    let exit = false;
    while (!exit) {
        console.log('\nMenu de Opções:');
        console.log('1 - Extrair e inserir pessoas');
        console.log('2 - Exibir todos os dados');
        console.log('3 - Filtrar dados por nome');
        console.log('4 - Sair');

        const option = await askQuestion('Escolha uma opção: ');

        switch (option.trim()) {
            case '1': {
                await extractAndInsertData('people-100000clean.csv', sequelize, Person);
                break;
            }
            case '2': {
                await displayData(Person);
                break;
            }
            case '3': {
                const nameTerm = await askQuestion('Digite o termo para filtro por nome: ');
                await filterByName(nameTerm, Person);
                break;
            }
            case '4':
                exit = true;
                break;
            default:
                console.log('Opção inválida! Por favor, escolha uma opção válida.');
        }
    }
    rl.close();
    console.log('Programa encerrado.');
}

main();
