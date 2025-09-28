
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Admin from '../models/adminModel.js'
import userModel from '../models/userModel.js'

// route for user login
const loginUser = async (req, res) => {
  try {
    const { email_id, password } = req.body
    
    // Validation
    if (!email_id || !password) {
      return res.status(400).json({ 
        code: 3000,
        result: { 
          status: 'error', 
          msg: 'Email and password are required' 
        }
      })
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email_id)) {
      return res.status(400).json({ 
        code: 3000,
        result: { 
          status: 'error', 
          msg: 'Please enter a valid email address' 
        }
      })
    }

    // Find user by email
    const user = await userModel.findOne({ email: email_id })
    if (!user) {
      return res.status(401).json({ 
        code: 3000,
        result: { 
          status: 'error', 
          msg: 'Invalid email or password' 
        }
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ 
        code: 3000,
        result: { 
          status: 'error', 
          msg: 'Invalid email or password' 
        }
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        name: user.name 
      }, 
      process.env.JWT_SECRET || 'devsecret', 
      { expiresIn: '7d' }
    )

    // Return success response
    res.status(200).json({ 
      code: 3000,
      result: { 
        status: 'success', 
        msg: 'Login successful!',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        token,
        userfullname: user.name
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      code: 5000,
      result: { 
        status: 'error', 
        msg: 'Internal server error. Please try again.' 
      }
    })
  }
}

// route for user register
const registerUser = async (req, res) => {
  try {
    const { full_name, email_id, mobile_number, password } = req.body
    
    // Validation
    if (!full_name || !email_id || !mobile_number || !password) {
      return res.status(400).json({ 
        code: 3000,
        result: { 
          status: 'error', 
          msg: 'All fields are required' 
        }
      })
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email_id)) {
      return res.status(400).json({ 
        code: 3000,
        result: { 
          status: 'error', 
          msg: 'Please enter a valid email address' 
        }
      })
    }

    // Phone number validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(mobile_number)) {
      return res.status(400).json({ 
        code: 3000,
        result: { 
          status: 'error', 
          msg: 'Please enter a valid 10-digit mobile number' 
        }
      })
    }

    // Password validation (8+ chars, uppercase, lowercase, number, special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        code: 3000,
        result: { 
          status: 'error', 
          msg: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
        }
      })
    }

    // Check if user already exists
    const existingUserByEmail = await userModel.findOne({ email: email_id })
    if (existingUserByEmail) {
      return res.status(400).json({ 
        code: 3000,
        result: { 
          status: 'error', 
          msg: 'User with this email already exists' 
        }
      })
    }

    const existingUserByPhone = await userModel.findOne({ phone: mobile_number })
    if (existingUserByPhone) {
      return res.status(400).json({ 
        code: 3000,
        result: { 
          status: 'error', 
          msg: 'User with this phone number already exists' 
        }
      })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = new userModel({
      name: full_name,
      email: email_id,
      phone: mobile_number,
      password: hashedPassword
    })

    const savedUser = await newUser.save()

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: savedUser._id, 
        email: savedUser.email,
        name: savedUser.name 
      }, 
      process.env.JWT_SECRET || 'devsecret', 
      { expiresIn: '7d' }
    )

    // Return success response matching expected format
    res.status(201).json({ 
      code: 3000,
      result: { 
        status: 'success', 
        msg: 'Account created successfully! Please verify your email.',
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          phone: savedUser.phone
        },
        token
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ 
      code: 5000,
      result: { 
        status: 'error', 
        msg: 'Internal server error. Please try again.' 
      }
    })
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