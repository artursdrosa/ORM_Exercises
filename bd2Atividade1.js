const { Sequelize, DataTypes, where} = require('sequelize'); //npm install --save sequelize , npm install --save mysql2
const MYSQL_IP="localhost";
const MYSQL_LOGIN="root";
const MYSQL_PASSWORD="1234";
const DATABASE = "sakila";
const sequelize = new Sequelize(DATABASE , MYSQL_LOGIN, MYSQL_PASSWORD, {
  host: MYSQL_IP,
  dialect: "mysql"
});
const Actor = sequelize.define('Actor', {
  actor_id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  first_name: {type: DataTypes.STRING,allowNull: false },
  last_name: {type: DataTypes.STRING, allowNull: false }
  }, {tableName: 'actor',timestamps: false});

  const Film = sequelize.define('Film', { 
  film_id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true  },
  title: {type: DataTypes.STRING  },
  description: {type: DataTypes.STRING,  allowNull: false},
  release_year: { type: DataTypes.DATE, }
  }, { tableName: 'film',timestamps: false});

  const ActorFilm = sequelize.define('ActorFilm', {
  actor_id: {type: DataTypes.INTEGER, references: {model: Actor} },
  film_id: { type: DataTypes.INTEGER, references: {model: Film, }}
  }, { tableName: 'film_actor', timestamps: false,});


Film.belongsToMany(Actor, { through: ActorFilm,foreignKey: 'film_id' }); 
Actor.belongsToMany(Film, { through: ActorFilm, foreignKey: 'actor_id' });
ActorFilm.belongsTo(Actor, { foreignKey: 'actor_id' });
ActorFilm.belongsTo(Film, { foreignKey: 'film_id' });


let listActorsFilm = async function() {
    try{
        let actorFilmCount = await ActorFilm.count();
        let actorFilmLoaded = await ActorFilm.findAll({
                          include: [Actor, Film],
                          limit: 100});
        console.log("\n\n\nA QUANTIDADE TOTAL DE ACTORFILM LISTADOS NA TABELA SÃO", actorFilmCount, "REGISTROS. SEGUE OS DADOS DOS 100 PRIMEIROS:");
        for(let i= 1; i<101; i++){
          console.log("\n\n===========ACTOR FILM", i, "===========\n\n");
          console.log(JSON.stringify(actorFilmLoaded[i-1], null, 2));
        }
    }catch (error){
        console.log("Error Log", error);
    }
}

let listActor = async function () {
    try {
        let actorCount = await Actor.count();
        let actorLoaded = await Actor.findAll({limit: 100});

        console.log("\n\n\nA QUANTIDADE TOTAL DE ACTOR LISTADOS NA TABELA SÃO", actorCount, "REGISTROS. SEGUE OS DADOS DOS 100 PRIMEIROS:");
        for(let i= 1; i<101; i++){
          console.log("\n\n===========ACTOR", i, "===========\n\n");
          console.log(JSON.stringify(actorLoaded[i-1], null, 2));
        }
    } catch (error) {
        console.log("Error Log", error);
    }
}

let listFilm = async function () {
    try {
      let filmCount = await Film.count();
      let filmLoaded = await Film.findAll({limit: 100});
      console.log("\n\n\nA QUANTIDADE TOTAL DE FILM LISTADOS NA TABELA SÃO", filmCount, "REGISTROS. SEGUE OS DADOS DOS 100 PRIMEIROS:");
      for(let i= 1; i<101; i++){
        console.log("\n\n===========FILM", i, "===========\n\n");
        console.log(JSON.stringify(filmLoaded[i-1], null, 2));
      }
    } catch (error) {
        console.log("Error Log", error);
    }
}

//listActorsFilm();
//listActor();
listFilm();