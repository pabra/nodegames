const locks = require('locks');

const definePropertyMutex = locks.createMutex();
const createMutexMutex = locks.createMutex();
const lockObjects = {};
let uniqueId = 0;

async function getIdOf(o) {
    if ( typeof o.__uniqueId === 'undefined' ) {
        await new Promise((resolve, reject) => {
            definePropertyMutex.timedLock(5000, err => {
                if (err) reject(err);
                else resolve();
            });
        });

        if ( typeof o.__uniqueId === 'undefined' ) {
            Object.defineProperty(o, '__uniqueId', {
                value: ++uniqueId,
                configurable: false,
                enumerable: false,
                writable: false,
            });
        }

        definePropertyMutex.unlock();
    }

    return o.__uniqueId;
}

async function getLockFor(o) {
    const oId = await getIdOf(o);

    if (!lockObjects[oId]) {
        await new Promise((resolve, reject) => {
            createMutexMutex.timedLock(5000, err => {
                if (err) reject(err);
                else resolve();
            });
        });

        if (!lockObjects[oId]) {
            lockObjects[oId] = locks.createMutex();
        }

        createMutexMutex.unlock();
    }

    const mut = lockObjects[oId];

    return new Promise((resolve, reject) => {
        mut.timedLock(5000, err => {
            if (err) reject(err);
            else resolve(mut);
        });
    });
}

module.exports = getLockFor;
