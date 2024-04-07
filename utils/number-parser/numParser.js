import {
    isValidPhoneNumber,
} from 'libphonenumber-js';

import parsePhoneNumber from 'libphonenumber-js';

function isValidNumber(number) {
    if (!isValidPhoneNumber(number)) {
        return false; // Should instead throw an Error
    } else {
        const phoneNumber = parsePhoneNumber(number);
        if (phoneNumber) {
            if (phoneNumber.country != 'KE') {
                return ("Country is currently not supported");
            }
            return (Object.keys(phoneNumber).filter(key => key != "metadata").reduce((acc, key) => {
                acc[key] = phoneNumber[key];
                return acc;
            }, {}));
        }
    }
}

export default isValidNumber;