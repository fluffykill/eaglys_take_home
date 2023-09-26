import { useState } from 'react';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const ParserPage = (props) => {

  const [sqlString, setSqlString] = useState("");
  const [parsedSqlString, setParsedSqlString] = useState("");
  const [hashedColumns, setHashedColumns] = useState(undefined);
  const [parseError, setParseError] = useState(false);

  const parseSqlRequest = async () => {
    fetch('/api/parse/', 
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql: sqlString })
    })
        .then(response => response.json())
        .then(data => {
          setParsedSqlString(data.modifiedSQL);
          setHashedColumns(data.hashedColumns)
          setParseError(false);
        }).catch((error) => {
          console.log(error)
          setParseError(true);
        });;
  }

  const getAllColumnsRequest = async  () => {
    fetch('/api/parse/')
      .then(response => response.json())
      .then(data => {
        setHashedColumns(data)
      }).catch((error) => {
        console.log(error)
      });
  }

  return (
    <Container component="main" sx={{ mb: 4 }}>
      <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }}}>
        <TextField 
          variant="outlined" 
          fullWidth 
          multiline 
          sx={{mb: 2}} 
          error={parseError}
          helperText={parseError ? "Failed to parse sql. Please enter a correct sql statment." : ""}
          label="Enter Your SQL" 
          value={sqlString} 
          onChange={(e) => {setSqlString(e.target.value)}}
        />
        
        <Button 
          variant="contained" 
          fullWidth
          sx={{mb: 2}} 
          onClick={(e) => {
            parseSqlRequest();
          }}
        >
          Parse Sql
        </Button>

        <TextField 
          disabled
          variant="outlined" 
          fullWidth 
          multiline 
          label="Parsed SQL" 
          sx={{mb: 2}} 
          value={parsedSqlString} 
        />

        <Button 
          variant="contained" 
          fullWidth
          sx={{mb: 2}} 
          onClick={getAllColumnsRequest}
        >
          Get All Columns
        </Button>

        {hashedColumns && 
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Column Name</TableCell>
                  <TableCell align="right">Hashed Column Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hashedColumns.sort((a,b) => a[0] >= b[0] ? 1 : -1).map((column) => (
                  <TableRow
                    key={column[0]}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {column[0]}
                    </TableCell>
                    <TableCell align="right">{column[1]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        }

      </Paper>
    </Container>
    
  );
}

export default ParserPage;