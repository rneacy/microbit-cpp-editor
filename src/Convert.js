function convert(code) {
    code = code.replace(/\n/g, '\\\\n');
    code = code.replace(/"/g, '\\"');
    code = code.replace(/\t/g, '')

    code = "{\"program\": \"" + code
    code = code + "\"}"

    console.log(code);
}

export default convert;