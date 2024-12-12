
const isLink = (msg) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return urlPattern.test(msg);
};

const isEmoticon = (msg) => {
    const emoticonPattern = /[\u263a-\u27bf\uD83C-\uDBFF\uDC00-\uDFFF]+/g;
    return emoticonPattern.test(msg);
};

const isPhoto = (imageDB) => {
    return imageDB.getImage() !== null;
};
