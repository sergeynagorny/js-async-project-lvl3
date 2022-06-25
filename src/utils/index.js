import prettier from 'prettier'

export const formatHtml = (html) => prettier.format(html, { parser: 'html' })

export const formatUrl = (requestUrl) => {
    const Reg = {
        protocol: new RegExp(/^https?:\/\//),
        characters: new RegExp(`([/]|[.](?![a-z0-9]+$))`, 'g'),
        eitherSide: new RegExp(`^-|-$`, 'g'),
    }

    return requestUrl
        .toString()
        .replace(Reg.protocol, '')
        .replace(Reg.characters, '-')
        .replace(Reg.eitherSide, '')
}

export const normalizeExtension = (str, ext) => {
    const EXT = 'html|png|jpg|css|js'
    const extRegExp = RegExp(`[.-](${EXT})$`)
    return str.match(extRegExp) ? str : str + ext
}
