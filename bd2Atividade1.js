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

/*let testConnection = async function(){
  try {
    let actorLoaded = await Actor.findByPk(1); 
    let allFilmsPerActor = await actorLoaded.getFilms();
    console.log(actorLoaded,allFilmsPerActor);
    let filmLoaded = await Film.findByPk(1);
    let allActorsPerFilm = await filmLoaded.getActors();
    console.log(filmLoaded,allActorsPerFilm);
    allFilmsPerActor = await ActorFilm.findAll({where: { actor_id: 1 }});
    console.log("Filmes por ator: ", allFilmsPerActor);

  } catch (error) {
    console.error("Error log", error);
  }
}
testConnection();*/

let listActorsFilm = async function() {
    try{
        let actorFilmLoaded = await ActorFilm.findOne({where:{film_id: 22}, include: [Actor, Film]});
        console.log("\n\n\n===========ACTOR FILM LISTAGEM===========\n\n\n", JSON.stringify(actorFilmLoaded, null, 2));
        //console.log("\n\n\n===========ACTOR LISTAGEM===========\n\n\n", JSON.stringify(actorFilmLoaded.dataValues.Actor.dataValues, null, 2));
    }catch (error){
        console.log("Error Log", error);
    }
}

let listActor = async function () {
    try {
        let actorLoaded = await Actor.findOne();
        console.log("\n\n\n===========ACTOR LISTAGEM===========\n\n\n", JSON.stringify(actorLoaded, null, 2));
    } catch (error) {
        
    }
}

//listActorsFilm();
listActor();