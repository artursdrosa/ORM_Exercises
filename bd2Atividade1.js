const { title } = require('process');
const { Json } = require('sequelize/lib/utils');
const { parse, resolve } = require('path');
const { read } = require('fs');
const { Sequelize, DataTypes, where } = require('sequelize');

// project files
const MYSQL_IP = "localhost";
const MYSQL_LOGIN = "root";
const MYSQL_PASSWORD = "root";
const DATABASE = "sakila";

const sequelize = new Sequelize(DATABASE, MYSQL_LOGIN, MYSQL_PASSWORD, {
  host: MYSQL_IP,
  dialect: "mysql"
});

const Actor = sequelize.define('Actor', {
  actor_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  first_name: { type: DataTypes.STRING, allowNull: false },
  last_name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'actor', timestamps: false });

const Film = sequelize.define('Film', {
  film_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING },
  description: { type: DataTypes.STRING, allowNull: false },
  release_year: { type: DataTypes.INTEGER },
  language_id: { type: DataTypes.INTEGER, allowNull: false },
  rental_duration: { type: DataTypes.INTEGER, allowNull: false },
  rental_rate: { type: DataTypes.DOUBLE, allowNull: false },
  length: { type: DataTypes.INTEGER, allowNull: false },
  replacement_cost: { type: DataTypes.DOUBLE, allowNull: false },
  rating: { type: DataTypes.STRING, allowNull: false },
  special_features: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'film', timestamps: false });

const ActorFilm = sequelize.define('ActorFilm', {
  actor_id: { type: DataTypes.INTEGER, references: { model: Actor } },
  film_id: { type: DataTypes.INTEGER, references: { model: Film } }
}, { tableName: 'film_actor', timestamps: false });

Film.belongsToMany(Actor, { through: ActorFilm, foreignKey: 'film_id' });
Actor.belongsToMany(Film, { through: ActorFilm, foreignKey: 'actor_id' });
ActorFilm.belongsTo(Actor, { foreignKey: 'actor_id' });
ActorFilm.belongsTo(Film, { foreignKey: 'film_id' });

const readline = require('readline');

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

async function listActorsFilm() {
  try {
    let actorFilmCount = await ActorFilm.count();
    let actorFilmLoaded = await ActorFilm.findAll({
      include: [Actor, Film],
      limit: 100
    });
    console.log("\n\n\nA QUANTIDADE TOTAL DE ACTORFILM LISTADOS NA TABELA SÃO", actorFilmCount, "REGISTROS. SEGUE OS DADOS DOS 100 PRIMEIROS:");
    for (let i = 1; i < 101; i++) {
      console.log("\n\n===========ACTOR FILM", i, "===========\n\n");
      console.log(JSON.stringify(actorFilmLoaded[i - 1], null, 2));
    }
  } catch (error) {
    console.log("Error Log", error);
  }
}

async function listActor() {
  try {
    let actorCount = await Actor.count();
    let actorLoaded = await Actor.findAll({ limit: 100 });
    console.log("\n\n\nA QUANTIDADE TOTAL DE ACTOR LISTADOS NA TABELA SÃO", actorCount, "REGISTROS. SEGUE OS DADOS DOS 100 PRIMEIROS:");
    for (let i = 1; i < 101; i++) {
      console.log("\n\n===========ACTOR", i, "===========\n\n");
      console.log(JSON.stringify(actorLoaded[i - 1], null, 2));
    }
  } catch (error) {
    console.log("Error Log", error);
  }
}

async function listFilm() {
  try {
    let filmCount = await Film.count();
    let filmLoaded = await Film.findAll({ limit: 100 });
    console.log("\n\n\nA QUANTIDADE TOTAL DE FILM LISTADOS NA TABELA SÃO", filmCount, "REGISTROS. SEGUE OS DADOS DOS 100 PRIMEIROS:");
    for (let i = 1; i < 101; i++) {
      console.log("\n\n===========FILM", i, "===========\n\n");
      console.log(JSON.stringify(filmLoaded[i - 1], null, 2));
    }
  } catch (error) {
    console.log("Error Log", error);
  }
}

async function insertActor() {
  const firstName = await askQuestion("Digite o primeiro nome do ator: ");
  const lastName = await askQuestion("Digite o último nome do ator: ");
  try {
    const actor = await Actor.create({ first_name: firstName, last_name: lastName });
    console.log("Ator inserido com sucesso:\n\n", JSON.stringify(actor, null, 2));
  } catch (error) {
    console.log("Erro ao inserir ator:", error);
  }
}

function gerarNumAleatorio(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

async function insertFilm() {
  const titleFilm = await askQuestion("Digite o título do Filme: ");
  const descriptionFilm = await askQuestion("Digite a descrição do Filme: ");
  const releaseYear = await askQuestion("Digite o ano de lançamento: ");
  console.log("CATÁLOGO DE LÍNGUAS:\n 1 - Inglês \n 2 - Italiano \n 3 - Japonês \n 4 - Mandarim \n 5 - Francês \n 6 - Alemão");
  const languageID = await askQuestion("Digite o número referente à língua do filme: ");
  const rentalDuration = await askQuestion("Digite por quanto tempo deseja ficar com o filme: ");
  const rental_rate = parseFloat(gerarNumAleatorio(0.99, 7.99));
  console.log("Taxa de aluguel: ", rental_rate);
  const length = Math.floor(gerarNumAleatorio(60, 240));
  console.log("Tempo de filme: ", length);
  const replacement_cost = parseFloat(gerarNumAleatorio(19.99, 69.99));
  console.log("Taxa caso perda ou estragar: ", replacement_cost);
  const rating = "PG";
  const special_features = "Trailers";

  try {
    const film = await Film.create({
      title: titleFilm,
      description: descriptionFilm,
      release_year: releaseYear,
      language_id: languageID,
      rental_duration: rentalDuration,
      rental_rate,
      length,
      replacement_cost,
      rating,
      special_features
    });
    console.log("Filme inserido com sucesso:\n\n", JSON.stringify(film, null, 2));
  } catch (error) {
    console.log("Erro ao inserir filme: ", error);
  }
}

async function insertActorFilm() {
  async function getValidId(entity, entityName) {
    let isValid = false;
    let id;
    while (!isValid) {
      const inputId = await askQuestion(`Digite um ${entityName}_id existente: `);
      id = parseInt(inputId);
      const count = await entity.count({ where: { [`${entityName}_id`]: id } });
      if (count > 0) {
        isValid = true;
      } else {
        console.log(`${entityName}_id não encontrado. Tente novamente.`);
      }
    }
    return id;
  }

  try {
    const actor_id = await getValidId(Actor, "actor");
    const film_id = await getValidId(Film, "film");

    const actorFilm = await ActorFilm.create({
      actor_id,
      film_id
    });

    console.log("ID do filme e do ator inserido com sucesso: ", JSON.stringify(actorFilm, null, 2));
  } catch (error) {
    console.log("Erro ao inserir: ", error);
  }
}

async function main() {
  let exit = false;
  while (!exit) {
    console.log("\n====== MENU ======");
    console.log("1 - Listar ActorFilm");
    console.log("2 - Listar Actor");
    console.log("3 - Listar Film");
    console.log("4 - Inserir Actor");
    console.log("5 - Inserir Film");
    console.log("6 - Inserir ActorFilm");
    console.log("7 - Sair");

    const option = await askQuestion("Escolha uma opção: ");

    switch (option.trim()) {
      case "1":
        await listActorsFilm();
        break;
      case "2":
        await listActor();
        break;
      case "3":
        await listFilm();
        break;
      case "4":
        await insertActor();
        break;
      case "5":
        await insertFilm();
        break;
      case "6":
        await insertActorFilm();
        break;
      case "7":
        exit = true;
        break;
      default:
        console.log("Opção inválida! Por favor, escolha uma opção válida.");
    }
  }
  rl.close();
  console.log("Programa encerrado.");
}

main();
