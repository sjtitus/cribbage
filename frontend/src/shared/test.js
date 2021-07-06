
const dstring = "2011-08-12U20:17:46.384Z";

const utcTimestampRegexp = new RegExp('^([0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T([0-9]{2}):([0-9]{2}):([0-9]{2})\.([0-9]{3})Z');

const m = dstring.match(utcTimestampRegexp);

/*
import { User}  from './models/User.js';

const u = new User({
    id: 1,
    email:'stitus@titus.com',
    firstName:'steve',
    lastName:'titus',
    created:'titus',
    modified:'titus',
    deleted:'titus'
});
u._validate();
*/