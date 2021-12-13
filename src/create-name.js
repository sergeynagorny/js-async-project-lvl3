const EXT = 'html|png|jpg|css|js'

const Reg = {
    protocol: new RegExp(/^https?:\/\//),
    characters: new RegExp(`[./_](?!(${EXT})$)`, 'g'),
    extension: new RegExp(`[.-](${EXT})$`),
    eitherSide: new RegExp(`^-|-$`, 'g'),
}

export default function createName(requestUrl, ext) {
    let url = requestUrl
        .toString()
        .replace(Reg.protocol, '')
        .replace(Reg.characters, '-')
        .replace(Reg.eitherSide, '')

    if (ext !== undefined) {
        url = Reg.extension.test(url) ? url.replace(Reg.extension, ext) : url + ext
    }

    return url
}
