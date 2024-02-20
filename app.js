const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started')
    })
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const convertToCamelCase = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
// API 1 GET METHOD
app.get('/movies/', async (request, response) => {
  const getMovies = `
    SELECT * 
    FROM movie
    ORDER BY 
    movie_id`
  const movieList = await db.all(getMovies)

  const movieArray = movieList.map(eachMovie => {
    return convertToCamelCase(eachMovie)
  })

  const onlyMovieName = movieArray
  response.send(
    onlyMovieName.map(eachMovie => {
      return {movieName: eachMovie.movieName}
    }),
  )
})

// API 2 POST METHOD
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovie = `
  INSERT INTO 
    movie(director_id,movie_name,lead_actor)
  VALUES(
    ${directorId},
    '${movieName}',
    '${leadActor}');`
  const newMovie = await db.run(addMovie)
  response.send('Movie Successfully Added')
})

// API 3 GET METHOD
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getParticularMovies = `
    SELECT * 
    FROM movie
    WHERE
    movie_id = ${movieId}`
  const particularMovie = await db.get(getParticularMovies)

  response.send(convertToCamelCase(particularMovie))
})

//API 4 PUT METHOD
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovie = `
  UPDATE
    movie
  SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE 
    movie_id = ${movieId}`

  const UpdatedMovie = await db.run(updateMovie)
  response.send('Movie Details Updated')
})

// API 5 DELETE METHOD
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const deleteMovie = `
  DELETE FROM
    movie
  WHERE 
    movie_id = ${movieId}`

  const deletedMovie = await db.run(deleteMovie)
  response.send('Movie Removed')
})

// API 6 GET METHOD
const caseConversion = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/directors/', async (request, response) => {
  const getDirectors = `
    SELECT * 
    FROM director
    ORDER BY 
    director_id`
  const directorsList = await db.all(getDirectors)

  response.send(
    directorsList.map(eachDirector => {
      return caseConversion(eachDirector)
    }),
  )
})

// API 7 GET METHOD
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMovieName = `
    SELECT movie_name 
    FROM movie
    WHERE
    director_id = ${directorId}`
  const movieNameList = await db.all(getMovieName)

  const movieArray = movieNameList.map(eachMovie => {
    return convertToCamelCase(eachMovie)
  })

  const onlyMovieName = movieArray
  response.send(
    onlyMovieName.map(eachMovie => {
      return {movieName: eachMovie.movieName}
    }),
  )
})

module.exports = app
