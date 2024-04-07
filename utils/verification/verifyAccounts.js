export default function generateVerificationCode() {
    return Math.floor(10000 + Math.random() * 90000);
}