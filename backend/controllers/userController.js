
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

    // Check if profile is completed
    const profileCompleted = isProfileCompleted(user)

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
        userfullname: user.name,
        profileCompleted
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
    const { full_name, email_id, mobile_number, password, dob, nationality, address1, address2, city, state, pincode, country } = req.body
    
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

    // Create new user with profile data if provided
    const userData = {
      name: full_name,
      email: email_id,
      phone: mobile_number,
      password: hashedPassword,
      registerThrough: req.body.registerThrough || 'frontend',
      registrationDate: new Date()
    }

    // Add profile fields if provided (for admin registration)
    if (dob) userData.dob = new Date(dob)
    if (nationality) userData.nationality = nationality
    if (address1) userData.address1 = address1
    if (address2 !== undefined) userData.address2 = address2
    if (city) userData.city = city
    if (state) userData.state = state
    if (pincode) userData.pincode = pincode
    if (country) userData.country = country

    const newUser = new userModel(userData)
    const savedUser = await newUser.save()

    // Check if profile is completed
    const profileCompleted = isProfileCompleted(savedUser)
    if (profileCompleted) {
      savedUser.profileCompleted = true
      await savedUser.save()
    }

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
        msg: profileCompleted ? 'Account created successfully with complete profile!' : 'Account created successfully! Please verify your email.',
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          phone: savedUser.phone
        },
        token,
        userfullname: savedUser.name,
        profileCompleted
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

// Helper function to check if profile is completed
const isProfileCompleted = (user) => {
  const requiredFields = ['dob', 'nationality', 'address1', 'city', 'state', 'pincode', 'country']
  return requiredFields.every(field => user[field] && user[field].toString().trim() !== '')
}

// route for getting user profile
const getUserProfile = async (req, res) => {
  try {
    const user = req.user
    
    // Check if profile is completed
    const profileCompleted = isProfileCompleted(user)
    
    res.status(200).json({
      code: 3000,
      result: {
        status: 'success',
        msg: 'Profile retrieved successfully',
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        nationality: user.nationality,
        address1: user.address1,
        address2: user.address2,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        country: user.country,
        profileCompleted
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      code: 5000,
      result: {
        status: 'error',
        msg: 'Internal server error. Please try again.'
      }
    })
  }
}

// route for updating user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id
    const { 
      full_name, 
      mobile_number, 
      dob, 
      nationality, 
      address1, 
      address2, 
      city, 
      state, 
      pincode, 
      country 
    } = req.body

    // Validation for mobile number if it's being updated
    if (mobile_number && mobile_number !== req.user.phone) {
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

      // Check if phone number is already taken by another user
      const existingUser = await userModel.findOne({ 
        phone: mobile_number, 
        _id: { $ne: userId } 
      })
      if (existingUser) {
        return res.status(400).json({
          code: 3000,
          result: {
            status: 'error',
            msg: 'This phone number is already in use'
          }
        })
      }
    }

    // Parse date if provided
    let dobDate = null
    if (dob) {
      dobDate = new Date(dob)
      if (isNaN(dobDate.getTime())) {
        return res.status(400).json({
          code: 3000,
          result: {
            status: 'error',
            msg: 'Invalid date format'
          }
        })
      }
    }

    // Update user profile
    const updateData = {}
    if (full_name) updateData.name = full_name
    if (mobile_number) updateData.phone = mobile_number
    if (dobDate) updateData.dob = dobDate
    if (nationality) updateData.nationality = nationality
    if (address1) updateData.address1 = address1
    if (address2 !== undefined) updateData.address2 = address2 // Allow empty string
    if (city) updateData.city = city
    if (state) updateData.state = state
    if (pincode) updateData.pincode = pincode
    if (country) updateData.country = country

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    // Check if profile is now completed
    const profileCompleted = isProfileCompleted(updatedUser)
    updatedUser.profileCompleted = profileCompleted
    await updatedUser.save()

    res.status(200).json({
      code: 3000,
      result: {
        status: 'success',
        msg: 'Profile updated successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          dob: updatedUser.dob,
          nationality: updatedUser.nationality,
          address1: updatedUser.address1,
          address2: updatedUser.address2,
          city: updatedUser.city,
          state: updatedUser.state,
          pincode: updatedUser.pincode,
          country: updatedUser.country,
          profileCompleted
        }
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      code: 5000,
      result: {
        status: 'error',
        msg: 'Internal server error. Please try again.'
      }
    })
  }
}

// route for getting all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select('-password')
    
    res.status(200).json({
      success: true,
      users: users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        nationality: user.nationality,
        address1: user.address1,
        address2: user.address2,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        country: user.country,
        profileCompleted: user.profileCompleted,
        registrationDate: user.registrationDate,
        registerThrough: user.registerThrough
      }))
    })
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again.'
    })
  }
}

// route for updating user by ID (admin only)
const updateUserById = async (req, res) => {
  try {
    const userId = req.params.id
    const { 
      name, 
      phone, 
      email,
      dob, 
      nationality, 
      address1, 
      address2, 
      city, 
      state, 
      pincode, 
      country 
    } = req.body

    // Find user
    const user = await userModel.findById(userId)
    if (!user) {
      return res.status(404).json({
        code: 3000,
        result: {
          status: 'error',
          msg: 'User not found'
        }
      })
    }

    // Validation for phone number if it's being updated
    if (phone && phone !== user.phone) {
      const phoneRegex = /^[0-9]{10}$/
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          code: 3000,
          result: {
            status: 'error',
            msg: 'Please enter a valid 10-digit mobile number'
          }
        })
      }

      // Check if phone number is already taken by another user
      const existingUser = await userModel.findOne({ 
        phone: phone, 
        _id: { $ne: userId } 
      })
      if (existingUser) {
        return res.status(400).json({
          code: 3000,
          result: {
            status: 'error',
            msg: 'This phone number is already in use'
          }
        })
      }
    }

    // Validation for email if it's being updated
    if (email && email !== user.email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          code: 3000,
          result: {
            status: 'error',
            msg: 'Please enter a valid email address'
          }
        })
      }

      // Check if email is already taken by another user
      const existingUser = await userModel.findOne({ 
        email: email, 
        _id: { $ne: userId } 
      })
      if (existingUser) {
        return res.status(400).json({
          code: 3000,
          result: {
            status: 'error',
            msg: 'This email is already in use'
          }
        })
      }
    }

    // Parse date if provided
    let dobDate = null
    if (dob) {
      dobDate = new Date(dob)
      if (isNaN(dobDate.getTime())) {
        return res.status(400).json({
          code: 3000,
          result: {
            status: 'error',
            msg: 'Invalid date format'
          }
        })
      }
    }

    // Update user data
    const updateData = {}
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (email) updateData.email = email
    if (dobDate) updateData.dob = dobDate
    if (nationality) updateData.nationality = nationality
    if (address1 !== undefined) updateData.address1 = address1
    if (address2 !== undefined) updateData.address2 = address2
    if (city) updateData.city = city
    if (state) updateData.state = state
    if (pincode) updateData.pincode = pincode
    if (country) updateData.country = country

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    // Check if profile is now completed
    const profileCompleted = isProfileCompleted(updatedUser)
    updatedUser.profileCompleted = profileCompleted
    await updatedUser.save()

    res.status(200).json({
      success: true,
      code: 3000,
      result: {
        status: 'success',
        msg: 'User updated successfully',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          dob: updatedUser.dob,
          nationality: updatedUser.nationality,
          address1: updatedUser.address1,
          address2: updatedUser.address2,
          city: updatedUser.city,
          state: updatedUser.state,
          pincode: updatedUser.pincode,
          country: updatedUser.country,
          profileCompleted
        }
      }
    })
  } catch (error) {
    console.error('Update user by ID error:', error)
    res.status(500).json({
      success: false,
      code: 5000,
      result: {
        status: 'error',
        msg: 'Internal server error. Please try again.'
      }
    })
  }
}

// route for deleting user by ID (admin only)
const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id
    
    const user = await userModel.findById(userId)
    if (!user) {
      return res.status(404).json({
        code: 3000,
        result: {
          status: 'error',
          msg: 'User not found'
        }
      })
    }

    await userModel.findByIdAndDelete(userId)

    res.status(200).json({
      success: true,
      code: 3000,
      result: {
        status: 'success',
        msg: 'User deleted successfully'
      }
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({
      success: false,
      code: 5000,
      result: {
        status: 'error',
        msg: 'Internal server error. Please try again.'
      }
    })
  }
}

export { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile, getAllUsers, updateUserById, deleteUserById }