import createName from '../src/create-name.js'

test('function is working correctly', () => {
    expect(createName('https://google.com/webhp')).toBe('google-com-webhp')
    expect(createName('/google.com/webhp/')).toBe('google-com-webhp')
    expect(createName('https://google.com/webhp.html', '')).toBe('google-com-webhp')
    expect(createName('https://google.com/webhp', '.html')).toBe('google-com-webhp.html')
    expect(createName('https://google.com/webhp.html', '_files')).toBe('google-com-webhp_files')
})
