import { ApiError } from '@/lib/ApiError';
import { ApiResponse } from '@/lib/ApiResponse';
import { dbConnect, dbDisconnect } from '@/lib/dbConnect';
import { uploadToCloudinary } from '@/lib/upload';
import { UserModel } from '@/models/user.model';
import { signUpSchema } from '@/schemas/auth.schema';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Signup
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const formData = await request.formData();

    console.log('Form data: ', formData);

    const file = formData.get('avatar') as File | null;

    console.log('File: ', file);

    if (!file) {
      return NextResponse.json(
        new ApiError(400, 'Failed to register user: Avatar file is missing.'),
        {
          status: 400,
        }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload avatar to Cloudinary
    const avatarUrl = await uploadToCloudinary(buffer, 'uploads/avatars');

    // Parse address field
    // const addressField = formData.get('address')?.toString() || '';

    // let address;

    // try {
    //   address = JSON.parse(addressField);
    // } catch (err) {
    //   console.error('Error parsing address field:', err);
    //   return NextResponse.json(
    //     new ApiError(400, 'Failed to register user: Invalid address format'),
    //     {
    //       status: 400,
    //     }
    //   );
    // }

    // Parse address field
    const address = {
      street: formData.get('address[street]')?.toString() || '',
      city: formData.get('address[city]')?.toString() || '',
      state: formData.get('address[state]')?.toString() || '',
      country: formData.get('address[country]')?.toString() || '',
      pinCode: formData.get('address[pinCode]')?.toString() || '',
    };

    // Extract other form fields
    const userData = {
      firstName: formData.get('firstName')?.toString() || '',
      lastName: formData.get('lastName')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
      address,
      password: formData.get('password')?.toString() || '',
      avatar: avatarUrl,
    };

    console.log('User data: ', userData);

    // Validate user data
    const parsed = signUpSchema.safeParse(userData);

    if (!parsed.success) {
      const err = parsed.error.errors.map((err) => err.message);

      return NextResponse.json(
        new ApiError(400, 'Failed to register user: Validation failed', err),
        {
          status: 400,
        }
      );
    }

    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email: parsed.data.email });

    if (existingUser) {
      return NextResponse.json(
        new ApiError(409, 'Failed to register user: User with this email already exists.'),
        {
          status: 409,
        }
      );
    }

    // Create a new user
    const newUser = new UserModel(parsed.data);
    await newUser.save();

    // Format the response data
    const responseData = {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      avatar: newUser.avatar,
      role: 'user',
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    await dbDisconnect();

    return NextResponse.json(new ApiResponse(201, responseData, 'User registered successfully.'), {
      status: 201,
    });
  } catch (err) {
    await dbDisconnect();
    console.error('Error registering user:', err);

    return NextResponse.json(new ApiError(500, 'Internal Server Error. Please try again later.'), {
      status: 500,
    });
  }
}
