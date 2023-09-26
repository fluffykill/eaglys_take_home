# eaglys_take_home

### Description


### Getting Started
Create 2 .env files, one in the root folder and one in the backend folder. The .env file in the backend folder doesn't need the pg admin credentials
```
DB_USER=
DB_PASSWORD=
DB_NAME=
PORT=
DBPORT=
HOST=
PGADMIN_EMAIL=
PGADMIN_PASSWORD=
```
In the frontend folder make sure the port in the proxy section in package.json matches the port in the .env file.

Make sure docker is installed. Run 
```bash
docker-compose build
``` 
to create the docker images. After creating the docker images make sure a database with the given db name exists and that a table called `hashed_columns` exist.

The table should have 2 columns
```sql
column_name: varchar() primary id
hashed_column: varchar()
```

### Running
To run the docker container
```bash
docker-compose up
```

### Endpoints
#### GET /api/parse
Returns the entire column name to hashed column name map as an array of arrays with the first element of the sub array being the column name and the 2nd being the hashed column name

#### POST /api/parse
This endpoint sends a post request with a body
```
{sql: <string>}
```
and returns the modified sql and an array representation of the mapped column name to hashed column name
```
{
  "modifiedSQL": <string>,
  "hashedColumns": [
    [<string>, <string>]
  ]
}
```

### Testing
To test the endpoints go to the backend folder and run
```bash
npm test
```

### Deployment
Refer to 
</br>
https://aws.amazon.com/getting-started/hands-on/deploy-docker-containers/
</br>
On deploying docker containers to aws
