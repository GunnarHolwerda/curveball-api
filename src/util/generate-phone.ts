export function generatePhone(): string {
    const getDigit = () => Math.round(Math.random() * 9);
    // tslint:disable-next-line
    const phone = `+1${getDigit()}${getDigit()}${getDigit()}${getDigit()}${getDigit()}${getDigit()}${getDigit()}${getDigit()}${getDigit()}${getDigit()}`;
    return phone;
}