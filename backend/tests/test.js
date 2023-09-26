const request = require("supertest");
const app = require("../app");
const { Pool } = require('pg');

// setup for to mock pg
jest.mock('pg', () => {
  const mPool = {
    connect: function () {
      return { query: jest.fn() };
    },
    query: jest.fn(() => ({rows: []})),
    end: jest.fn(),
    on: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe("Tests the sql parsing endpoints", () => {

  let pool;
  // before each test case
  beforeEach(() => {
    pool = new Pool();
  });
  // clean up after each test case done
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("It should response the GET method", done => {
    request(app)
      .get("/api/parse")
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });

  test("It should return 500 when given a bad sql statement", done => {
    const payload = {sql: "selrct z from test"};
    request(app)
      .post('/api/parse')
      .send(payload)
      .set('Content-Type', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(500);
        done();
      });
  });

  test("It should parse the sql and return the proper modified sql and map of the column names", done => {
    const payload = {sql: "select a,b from test"};
    request(app)
      .post('/api/parse')
      .send(payload)
      .set('Content-Type', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body.modifiedSQL).toBe('SELECT \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d\" FROM \"test\"');
        expect(response.body.hashedColumns.sort()).toEqual([
          [
            'a',
            'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
          ],
          [
            'b',
            '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d'
          ]
        ].sort());
        done();
      });
  });

  test("It should parse where and having properly", done => {
    const payload = {sql: "select a from test where b > 10 having c > 20"};
    request(app)
      .post('/api/parse')
      .send(payload)
      .set('Content-Type', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body.modifiedSQL).toBe('SELECT \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\" FROM \"test\" WHERE \"3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d\" > 10 HAVING \"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\" > 20');
        expect(response.body.hashedColumns.sort()).toEqual([
          [
            'a',
            'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
          ],
          [
            'b',
            '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d'
          ],
          [
            "c",
            "2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6",
          ]
        ].sort());
        done();
      });
  });

  test("It should parse joins properly", done => {
    const payload = {sql: "select test1.a, test2.b from test1 left join test2 on test1.c = test2.c"};
    request(app)
      .post('/api/parse')
      .send(payload)
      .set('Content-Type', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body.modifiedSQL).toBe('SELECT \"test1\".\"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"test2\".\"3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d\" FROM \"test1\" LEFT JOIN \"test2\" ON \"test1\".\"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\" = \"test2\".\"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\"');
        expect(response.body.hashedColumns.sort()).toEqual([
          [
            'a',
            'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
          ],
          [
            'b',
            '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d'
          ],
          [
            "c",
            "2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6",
          ]
        ].sort());
        done();
      });
  });

  test("It should parse nested selects properly", done => {
    const payload = {sql: "select a from (select c as a from test1) where a in (select b from test2)"};
    request(app)
      .post('/api/parse')
      .send(payload)
      .set('Content-Type', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body.modifiedSQL).toBe('SELECT \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\" FROM (SELECT \"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\" AS \"a\" FROM \"test1\") WHERE \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\" IN (SELECT \"3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d\" FROM \"test2\")');
        expect(response.body.hashedColumns.sort()).toEqual([
          [
            'a',
            'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
          ],
          [
            'b',
            '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d'
          ],
          [
            "c",
            "2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6",
          ]
        ].sort());
        done();
      });
  });

  test("It should parse group by properly", done => {
    const payload = {sql: "select a, sum(b), max(c) from test1 group by a"};
    request(app)
      .post('/api/parse')
      .send(payload)
      .set('Content-Type', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body.modifiedSQL).toBe('SELECT \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", SUM(\"3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d\"), MAX(\"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\") FROM \"test1\" GROUP BY \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\"');
        expect(response.body.hashedColumns.sort()).toEqual([
          [
            'a',
            'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
          ],
          [
            'b',
            '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d'
          ],
          [
            "c",
            "2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6",
          ]
        ].sort());
        done();
      });
  });

  test("It should parse inserts properly", done => {
    const payload = {sql: "insert into test1 (a, b, c) values (1, 2, 3)"};
    request(app)
      .post('/api/parse')
      .send(payload)
      .set('Content-Type', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body.modifiedSQL).toBe('INSERT INTO \"test1\" (\"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d\", \"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\") VALUES (1,2,3)');
        expect(response.body.hashedColumns.sort()).toEqual([
          [
            'a',
            'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
          ],
          [
            'b',
            '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d'
          ],
          [
            "c",
            "2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6",
          ]
        ].sort());
        done();
      });
  });

  test("It should parse deletes properly", done => {
    const payload = {sql: "delete from test1 where a < 10"};
    request(app)
      .post('/api/parse')
      .send(payload)
      .set('Content-Type', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body.modifiedSQL).toBe('DELETE FROM \"test1\" WHERE \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\" < 10');
        expect(response.body.hashedColumns.sort()).toEqual([
          [
            'a',
            'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
          ]
        ].sort());
        done();
      });
  });

  test("It should parse update properly", done => {
    const payload = {sql: "update table1 set a = 1, b = 2 where c > 10"};
    request(app)
      .post('/api/parse')
      .send(payload)
      .set('Content-Type', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body.modifiedSQL).toBe('UPDATE \"table1\" SET \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\" = 1, \"3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d\" = 2 WHERE \"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\" > 10');
        expect(response.body.hashedColumns.sort()).toEqual([
          [
            'a',
            'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
          ],
          [
            'b',
            '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d'
          ],
          [
            "c",
            "2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6",
          ]
        ].sort());
        done();
      });
  });

  test("It should parse multi lined sql properly", done => {
    const payload = {
      sql: "insert into test1 (a, b, c) values (1, 2, 3);" +
        "update table1 set a = 1, b = 2 where c > 10;" +
        "delete from test1 where c < 10;" +
        "select a,b,c from test1;"
    };
    request(app)
      .post('/api/parse')
      .send(payload)
      .set('Content-Type', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body.modifiedSQL).toBe('INSERT INTO \"test1\" (\"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d\", \"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\") VALUES (1,2,3) ; UPDATE \"table1\" SET \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\" = 1, \"3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d\" = 2 WHERE \"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\" > 10 ; DELETE FROM \"test1\" WHERE \"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\" < 10 ; SELECT \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d\", \"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\" FROM \"test1\"');
        expect(response.body.hashedColumns.sort()).toEqual([
          [
            'a',
            'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
          ],
          [
            'b',
            '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d'
          ],
          [
            "c",
            "2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6",
          ]
        ].sort());
        done();
      });
  });
});