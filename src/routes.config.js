const router = require('express').Router()
const User = require('./models/user')
const validateUserBody = require('./middleware/validateUserBody')
const token = require('./utils/token')
const store = require('./utils/store')

const isSecure = process.env.NODE_ENV === 'production'

router.post('/login', validateUserBody, async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.login(email, password)
    const accessToken = token.createAccessToken(user.id)
    const refreshToken = token.createRefreshToken(user.id)
    res.cookie('accessToken', accessToken, { secure: isSecure, httpOnly: true })
    res.cookie('refreshToken', refreshToken, {
      secure: isSecure,
      httpOnly: true,
    })
    await store.setRefreshToken(refreshToken)
    return res.json(user)
  } catch (err) {
    if (err.message === 'incorrect email or password') {
      return res.status(401).send(err.message)
    }
    return res.status(500).send('something went wrong')
  }
})

router.post('/register', validateUserBody, async (req, res) => {
  try {
    const user = await User.create(req.body)
    const accessToken = token.createAccessToken(user.id)
    const refreshToken = token.createRefreshToken(user.id)
    res.cookie('accessToken', accessToken, { secure: isSecure, httpOnly: true })
    res.cookie('refreshToken', refreshToken, {
      secure: isSecure,
      httpOnly: true,
    })
    await store.setRefreshToken(refreshToken)
    return res.status(201).json(user)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).send('user already exists')
    }
    return res.status(500).send('something went wrong')``
  }
})

router.post('/token', (req, res) => {
  res.send(
    'this endpoint generates a new access token from the user if they supply a valid refresh token'
  )
})

router.post('/logout', (req, res) => {
  res.send(
    'this endpoint destroys the refresh token session of the user in the cache'
  )
})

module.exports = router
