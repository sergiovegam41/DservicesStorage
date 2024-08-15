class Utils {
    static isNumeric(valor) {
        return /^-?\d+(\.\d+)?$/.test(valor);
    }
}

export default Utils 