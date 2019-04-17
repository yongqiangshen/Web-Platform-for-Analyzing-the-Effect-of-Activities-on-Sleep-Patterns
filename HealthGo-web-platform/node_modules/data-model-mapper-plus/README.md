# data-model-mapper
npm module to map (and revert mapping) data objects into another (specified) data model

### Usage

Let's assume we've got following object:

```javascript
{
    DATE: '20160512',
    TIME: '140000',
    FIRST_NAME: 'John',
    LAST_NAME: 'Doe',
    ID: 'EMP000210290'
}
```

We want to transform it to match our model:

```javascript
{
    id: 'EMP000210290'
    lastLogin: Thu May 12 2016 14:00:00 GMT+0200 (CEST), // JS Date object
    employeeName: 'John Doe'
}
```

We must create transform config:

```javascript
var moment = require('moment');

var mapDateTime = function (date, time) {
    return moment(date + time, 'YYYYMMDDHHmmss').toDate(); // moment.js library
};

var revertDateTime = function (dateObject) {
    var m = moment(dateObject);
    return [m.format('YYYYMMDD'), m.format('HHmmss')]; // dateObject has to be split into 2 fields (DATE, TIME).
                                                       // Function must return array of values.
};

var conf = [
    {
        dest: 'id',
        src: 'ID'
    }, {
        dest: 'lastLogin',
        src: ['DATE', 'TIME'],
        map: mapDateTime,
        revert: revertDateTime
    }, {
        dest: 'employeeName',
        src: ['FIRST_NAME', 'LAST_NAME'],
        map: function (fName, lName) { return fName + ' ' + lName; },
        revert: function (name) { return name.split(' '); }
    }
];
```

From now on, it's really simple. Just include data-model-mapper, create new instance of mapper, pass config array and map your object:

```javascript
var DMM = require('data-model-mapper');

var obj = {
    DATE: '20160512',
    TIME: '140000',
    FIRST_NAME: 'John',
    LAST_NAME: 'Doe',
    ID: 'EMP000210290'
};

var m = new DMM(conf);

var mapped = m.map(obj);
/* result is:
{
    id: 'EMP000210290'
    lastLogin: Thu May 12 2016 14:00:00 GMT+0200 (CEST), // JS Date object
    employeeName: 'John Doe'
}
*/

var reverted = m.revert(mapped);
/* result is original object */
```

### Configuration
Configuration array is a set of objects defining mapping process.

##### src (`String` or `Array`)
Source fields names (fields from original object). Fields that you want to use in your transformation. Values of this/these field(s) will be passed to `map` function.

##### dest (`String` or `Array`)
Destination fields names (fields created in mapped object). If array is passed fields from array will be created but `map` function should return array of values in order to properly populate fields' values.

##### map `Function`
###### _optional_
Transform function which maps `src` field(s) into `dest` field(s). Function gets parameter value(s) form field(s) specified in `src`. If `dest` is an array function should return array of values in order to properly populate fields' values.

If map function is not defined `dest` field(s) should contain values from `src` field(s);

##### revert `Function`
###### _optional_
Transform function which maps `dest` field(s) into `src` field(s). Function gets parameter value(s) form field(s) specified in `dest`. If `src` is an array function should return array of values in order to properly populate fields' values.

You do not have to provide `revert` function unless you want to get the original data model.

### New Functionality
`map` (and `revert` respectively) creates every `dest` destination field specified in the in `conf`. If `src` does not exist then the value of `dest` will be equal to `undefined`:

```javascript
var DMM = require('data-model-mapper');

var obj = {
    DATE: '20160512',
    TIME: '140000',
    FIRST_NAME: 'John',
    LAST_NAME: 'Doe'
    //ID missing
};

var m = new DMM(conf);

var mapped = m.map(obj);
/* result is:
{
    id: undefined
    lastLogin: Thu May 12 2016 14:00:00 GMT+0200 (CEST), // JS Date object
    employeeName: 'John Doe'
}
*/
```

Even though this functionality may be useful in some cases, there are times when we want to map only the fields that exist in the data we provide:

```javascript
var DMM = require('data-model-mapper');

var obj = {
    DATE: '20160512',
    TIME: '140000',
    FIRST_NAME: 'John',
    LAST_NAME: 'Doe'
    //ID missing
};

var m = new DMM(conf);

var mapped = m.map_existing_keys(obj);
/* result is:
{
    //id is not created as ID is not found in the src
    lastLogin: Thu May 12 2016 14:00:00 GMT+0200 (CEST), // JS Date object
    employeeName: 'John Doe'
}
*/
```

##### map_existing_keys `Function`
###### _optional_
Transform function which maps only existing `src` field(s) in provided data into `dest` field(s). Function gets parameter value(s) form field(s) specified in `src`. If `dest` is an array function should return array of values in order to properly populate fields' values.

##### revert_existing_keys `Function`
###### _optional_
Transform function which maps only existing `dest` field(s) in provided data into `src` field(s). Function gets parameter value(s) form field(s) specified in `dest`. If `src` is an array function should return array of values in order to properly populate fields' values.
