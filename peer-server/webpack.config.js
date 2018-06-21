const path = require('path')

module.exports = {
    entry: './source/client/app.jsx',
    output:
    {
        filename: 'source/app.js',
        path: path.resolve(__dirname, 'public')
    },
    module:
    {
        rules: [
        {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use:
            {
                loader: 'babel-loader'
            }
        },
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },
        {
            test: /\.(png|jp(e*)g|svg)$/,
            use:
            {
                loader: 'url-loader',
                options:
                {
                    limit: 8000, // Convert images < 8kb to base64 strings
                    name: 'images/[hash]-[name].[ext]'
                }
            }
        },
        {
            test: /\.(woff(2)?|ttf|eot|svg)$/,
            use:
            {
                loader: 'url-loader',
                options:
                {
                    name: 'fonts/[name].[ext]'
                }
            }
        }]
    },
    devServer:
    {
        contentBase: 'public'
    }
}
