
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Admin from '../models/adminModel.js'

// route for user login (placeholder)
const loginUser = async (req, res) => {
  try {
    res.status(200).json({ message: 'Login endpoint working' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// route for user register (placeholder)
const registerUser = async (req, res) => {
  try {
    res.status(200).json({ message: 'Register endpoint working' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// route for admin login
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ error: 'username and password are required' })

    const admin = await Admin.findOne({ username })
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' })

    const match = await bcrypt.compare(password, admin.password)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '8h' })

    res.status(200).json({ token, admin: { id: admin._id, username: admin.username, name: admin.name } })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export { loginUser, registerUser, adminLogin }