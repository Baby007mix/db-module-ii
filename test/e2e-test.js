'use strict';

const { expect } = require('chai');
const request = require('supertest');
const fs = require('fs');
const initialiseApp = require('../src/initialiseApp');

let server;

function copyDB() {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream('data/database.sqlite');
        const writeStream = fs.createWriteStream('test/database.tmp.sqlite');

        readStream.on('error', reject);
        writeStream.on('error', reject);
        writeStream.on('finish', resolve);

        readStream.pipe(writeStream);
    });
}

describe('The organisations API', function () {
    beforeEach(function () {
        /* create copy of database for each test
         * for the sake of test independence */
        return copyDB()
            .then(() => initialiseApp('test/database.tmp.sqlite'))
            .then(app => server = app);
    });

    after(function () {
        fs.unlinkSync('test/database.tmp.sqlite');
    });

    describe('HTTP GET to /organisations', function () {
        it('should list every organisation and its associated data', function () {
            return request(server)
                .get('/organisations')
                .expect(200)
                .expect('Content-Type', /json/)
                .then(response => {
                    expect(response.body.length).to.equal(3);

                    expect(response.body[0].Id).to.equal(1);
                    expect(response.body[0].Name).to.equal('Amnesty International');
                    expect(response.body[0].Address).to.equal('17-25 New Inn Yard');
                    expect(response.body[0].City).to.equal('London');
                    expect(response.body[0].PostCode).to.equal('EC2A 3EA');
                    expect(response.body[0].Telephone).to.equal('020 7033 1500');

                    expect(response.body[0].Services.length).to.equal(2);
                    expect(response.body[0].Services[0].Name).to.equal('Immigration');
                    expect(response.body[0].Services[1].Name).to.equal('Discrimination');

                    expect(response.body[0].Contacts.length).to.equal(2);
                    expect(response.body[0].Contacts[0].Name).to.equal('Joe Bloggs');
                    expect(response.body[0].Contacts[0].Email).to.equal('joe@bloggs.com');
                    expect(response.body[0].Contacts[1].Name).to.equal('John Doe');
                    expect(response.body[0].Contacts[1].Email).to.equal('johndoe@email.com');

                    expect(response.body[1].Id).to.equal(2);
                    expect(response.body[1].Name).to.equal('Refugee Council');
                    expect(response.body[1].Address).to.equal('PO Box 68614');

                    expect(response.body[1].City).to.equal('London');
                    expect(response.body[1].PostCode).to.equal('E15 9DQ');
                    expect(response.body[1].Telephone).to.equal('020 7346 6700');

                    expect(response.body[1].Services.length).to.equal(4);
                    expect(response.body[1].Services[0].Name).to.equal('Immigration');
                    expect(response.body[1].Services[1].Name).to.equal('Discrimination');
                    expect(response.body[1].Services[2].Name).to.equal('Housing');
                    expect(response.body[1].Services[3].Name).to.equal('Employment');

                    expect(response.body[1].Contacts.length).to.equal(1);
                    expect(response.body[1].Contacts[0].Name).to.equal('Ola Nordmann');
                    expect(response.body[1].Contacts[0].Email).to.equal('ola@email.com');

                    expect(response.body[2].Id).to.equal(3);
                    expect(response.body[2].Name).to.equal('Refugee Action');
                    expect(response.body[2].Address).to.equal('11 Belgrave Road');

                    expect(response.body[2].City).to.equal('London');
                    expect(response.body[2].PostCode).to.equal('SW1V 1RB');
                    expect(response.body[2].Telephone).to.equal('0207 952 1511');

                    expect(response.body[2].Services.length).to.equal(4);
                    expect(response.body[2].Services[0].Name).to.equal('Immigration');
                    expect(response.body[2].Services[1].Name).to.equal('Discrimination');
                    expect(response.body[2].Services[2].Name).to.equal('Housing');
                    expect(response.body[2].Services[3].Name).to.equal('Employment');

                    expect(response.body[2].Contacts.length).to.equal(1);
                    expect(response.body[2].Contacts[0].Name).to.equal('Greg Fred');
                    expect(response.body[2].Contacts[0].Email).to.equal('greg@fred.com');
                });
        });
    });

    describe('HTTP POST to /organisations', function () {
        it('should create a new organisation', function () {
            return request(server)
                .post('/organisations')
                .field('Name', 'Shelter')
                .field('Address', '88 Old Street')
                .field('City', 'London')
                .field('PostCode', 'EC1V 9HU')
                .field('Telephone', '0344 515 2000')
                .expect(200)
                .expect('Content-Type', /json/)
                .then(() => request(server).get('/organisations'))
                .then(response => {
                    expect(response.body.length).to.equal(4);

                    expect(response.body[3].Id).to.equal(4);
                    expect(response.body[3].Name).to.equal('Shelter');
                    expect(response.body[3].Address).to.equal('88 Old Street');
                    expect(response.body[3].City).to.equal('London');
                    expect(response.body[3].PostCode).to.equal('EC1V 9HU');
                    expect(response.body[3].Telephone).to.equal('0344 515 2000');
                });
        });
    });

    describe('HTTP PUT to /organisations', function () {
        it('should update an organisation`s address, telephone, and postcode', function () {
            return request(server)
                .put('/organisations/1')
                .field('Address', '90 Old Road')
                .field('City', 'Manchester')
                .field('PostCode', 'M13 9HU')
                .field('Telephone', '0344 515 3000')
                .expect(200)
                .expect('Content-Type', /json/)
                .then(() => request(server).get('/organisations'))
                .then(response => {
                    expect(response.body.length).to.equal(3);

                    expect(response.body[0].Id).to.equal(1);
                    expect(response.body[0].Name).to.equal('Amnesty International');
                    expect(response.body[0].Address).to.equal('90 Old Road');
                    expect(response.body[0].City).to.equal('Manchester');
                    expect(response.body[0].PostCode).to.equal('M13 9HU');
                    expect(response.body[0].Telephone).to.equal('0344 515 3000');
                });
        });
    });

    describe('HTTP DELETE to /organisations', function () {
        it('should delete an organisation', function () {
            return request(server)['delete']('/organisations/1')
                .expect(200)
                .expect('Content-Type', /json/)
                .then(() => request(server).get('/organisations'))
                .then(response => {
                    expect(response.body.length).to.equal(2);

                    expect(response.body[0].Name).to.equal('Refugee Council');
                });
        });
    });
});