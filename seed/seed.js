import bcrypt from 'bcrypt';
import User from '../models/User.js';
import SupportRequest from '../models/SupportRequest.js';
import SparePart from '../models/SparePart.js';
import KnowledgeBase from '../models/KnowledgeBase.js';

export async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await SupportRequest.deleteMany({});
    await SparePart.deleteMany({});
    await KnowledgeBase.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      email: 'admin@dern-support.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      accountType: 'business',
      businessName: 'Dern-Support',
      phone: '555-123-4567',
      address: {
        street: '123 Tech St',
        city: 'Silicon Valley',
        state: 'CA',
        zipCode: '94000',
        country: 'USA'
      },
      isAdmin: true
    });
    
    await admin.save();                                       
    console.log('Created admin user');
    
    // Create sample customers
    const customers = [
      {
        email: 'john.doe@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'John',
        lastName: 'Doe',
        accountType: 'individual',
        phone: '555-111-2222',
        address: {
          street: '456 Main St',
          city: 'Anytown',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        }
      },
      {
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Jane',
        lastName: 'Smith',
        accountType: 'individual',
        phone: '555-333-4444',
        address: {
          street: '789 Oak Ave',
          city: 'Somewhere',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        }
      },
      {
        email: 'acme@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Robert',
        lastName: 'Johnson',
        accountType: 'business',
        businessName: 'Acme Corporation',
        phone: '555-555-5555',
        address: {
          street: '100 Business Blvd',
          city: 'Metropolis',
          state: 'IL',
          zipCode: '60001',
          country: 'USA'
        }
      }
    ];
    
    const createdCustomers = await User.insertMany(customers);
    console.log('Created sample customers');
    
    // Create sample spare parts
    const spareParts = [
      {
        name: 'RAM 8GB DDR4',
        description: 'High-performance 8GB DDR4 RAM module',
        category: 'memory',
        compatibleDevices: ['desktop', 'laptop'],
        stockQuantity: 25,
        price: 49.99,
        supplier: {
          name: 'Memory Solutions Inc.',
          contactInfo: 'sales@memorysolutions.example.com'
        },
        location: 'Shelf A1',
        minimumStockLevel: 5
      },
      {
        name: 'SSD 500GB',
        description: 'Solid State Drive 500GB SATA',
        category: 'storage',
        compatibleDevices: ['desktop', 'laptop'],
        stockQuantity: 15,
        price: 79.99,
        supplier: {
          name: 'Storage Tech',
          contactInfo: 'orders@storagetech.example.com'
        },
        location: 'Shelf B2',
        minimumStockLevel: 3
      },
      {
        name: 'Laptop Power Adapter',
        description: 'Universal laptop power adapter 65W',
        category: 'power',
        compatibleDevices: ['laptop'],
        stockQuantity: 20,
        price: 29.99,
        supplier: {
          name: 'Power Supplies Co.',
          contactInfo: 'info@powersupplies.example.com'
        },
        location: 'Shelf C3',
        minimumStockLevel: 5
      },
      {
        name: 'Smartphone Screen',
        description: 'Replacement screen for popular smartphone models',
        category: 'display',
        compatibleDevices: ['smartphone'],
        stockQuantity: 10,
        price: 89.99,
        supplier: {
          name: 'Mobile Parts Ltd.',
          contactInfo: 'parts@mobileparts.example.com'
        },
        location: 'Shelf D4',
        minimumStockLevel: 2
      },
      {
        name: 'Network Cable Cat6',
        description: '10ft Cat6 Ethernet cable',
        category: 'network',
        compatibleDevices: ['desktop', 'laptop', 'server', 'network'],
        stockQuantity: 50,
        price: 9.99,
        supplier: {
          name: 'Network Supplies',
          contactInfo: 'sales@networksupplies.example.com'
        },
        location: 'Shelf E5',
        minimumStockLevel: 10
      },
      {
        name: 'CPU Cooling Fan',
        description: 'High-performance CPU cooling fan',
        category: 'other',
        compatibleDevices: ['desktop'],
        stockQuantity: 15,
        price: 24.99,
        supplier: {
          name: 'Cooling Systems Inc.',
          contactInfo: 'orders@coolingsystems.example.com'
        },
        location: 'Shelf F6',
        minimumStockLevel: 3
      },
      {
        name: 'Printer Toner Cartridge',
        description: 'Black toner cartridge for laser printers',
        category: 'other',
        compatibleDevices: ['printer'],
        stockQuantity: 30,
        price: 39.99,
        supplier: {
          name: 'Print Supplies Co.',
          contactInfo: 'info@printsupplies.example.com'
        },
        location: 'Shelf G7',
        minimumStockLevel: 5
      }
    ];
    
    const createdParts = await SparePart.insertMany(spareParts);
    console.log('Created sample spare parts');
    
    // Create sample support requests
    const supportRequests = [
      {
        customer: createdCustomers[0]._id,
        title: 'Computer won\'t boot',
        description: 'My desktop computer won\'t start. The power light comes on but nothing appears on the screen.',
        deviceType: 'desktop',
        urgency: 'high',
        status: 'pending',
        location: 'New York, NY',
        estimatedCost: 112.5 // Calculated: 75 * 1.5
      },
      {
        customer: createdCustomers[1]._id,
        title: 'Laptop battery not charging',
        description: 'My laptop battery isn\'t charging even when plugged in. The charging light doesn\'t come on.',
        deviceType: 'laptop',
        urgency: 'medium',
        status: 'assigned',
        assignedTo: admin._id,
        appointmentDate: new Date(Date.now() + 86400000), // Tomorrow
        location: 'Los Angeles, CA',
        estimatedCost: 106.25 // Calculated: 85 * 1.25
      },
      {
        customer: createdCustomers[2]._id,
        title: 'Network connectivity issues',
        description: 'Our office network keeps dropping connections. Affects multiple computers.',
        deviceType: 'network',
        urgency: 'critical',
        status: 'in-progress',
        assignedTo: admin._id,
        appointmentDate: new Date(),
        location: 'Chicago, IL',
        estimatedCost: 200, // Calculated: 100 * 2
        partsUsed: [
          {
            part: createdParts[4]._id, // Network Cable
            quantity: 2
          }
        ]
      },
      {
        customer: createdCustomers[0]._id,
        title: 'Smartphone screen cracked',
        description: 'I dropped my smartphone and the screen is cracked. Need a replacement.',
        deviceType: 'smartphone',
        urgency: 'low',
        status: 'resolved',
        assignedTo: admin._id,
        appointmentDate: new Date(Date.now() - 172800000), // 2 days ago
        location: 'New York, NY',
        estimatedCost: 60, // Calculated: 60 * 1
        actualCost: 149.99,
        partsUsed: [
          {
            part: createdParts[3]._id, // Smartphone Screen
            quantity: 1
          }
        ],
        resolution: 'Replaced cracked screen with new one',
        customerRating: 5,
        customerFeedback: 'Great service, fixed my phone quickly!'
      },
      {
        customer: createdCustomers[1]._id,
        title: 'Printer not working',
        description: 'My printer is showing an error and won\'t print anything.',
        deviceType: 'printer',
        urgency: 'medium',
        status: 'closed',
        assignedTo: admin._id,
        appointmentDate: new Date(Date.now() - 259200000), // 3 days ago
        location: 'Los Angeles, CA',
        estimatedCost: 87.5, // Calculated: 70 * 1.25
        actualCost: 79.99,
        partsUsed: [
          {
            part: createdParts[6]._id, // Printer Toner
            quantity: 1
          }
        ],
        resolution: 'Replaced toner cartridge and cleaned printer heads',
        customerRating: 4,
        customerFeedback: 'Printer works great now'
      }
    ];
    
    await SupportRequest.insertMany(supportRequests);
    console.log('Created sample support requests');
    
    // Create sample knowledge base articles
    const knowledgeBaseArticles = [
      {
        title: 'How to Troubleshoot Computer Boot Issues',
        content: `
# Troubleshooting Computer Boot Issues

If your computer won't boot, follow these steps to diagnose and potentially fix the issue:

## 1. Check the Power Supply
- Ensure the power cable is firmly connected to both the computer and the wall outlet
- Try a different power outlet
- If possible, try a different power cable

## 2. Check External Devices
- Disconnect all external devices (except keyboard and mouse)
- Try booting without these devices connected

## 3. Listen for Beep Codes
- When turning on your computer, listen for any beep patterns
- These beeps can indicate specific hardware issues

## 4. Check the Monitor
- Ensure the monitor is turned on and connected properly
- Try a different video cable or monitor if available

## 5. Reset CMOS
- Turn off and unplug your computer
- Locate the CMOS battery on the motherboard (round, silver battery)
- Remove it for about 5 minutes, then reinsert it
- This resets BIOS settings to default

## 6. Check RAM
- Turn off and unplug your computer
- Remove and reseat the RAM modules
- If you have multiple RAM sticks, try booting with just one at a time

If these steps don't resolve the issue, you may need professional assistance. Contact Dern-Support for help!
        `,
        deviceTypes: ['desktop', 'laptop'],
        category: 'hardware',
        tags: ['boot', 'power', 'troubleshooting', 'startup'],
        author: admin._id,
        viewCount: 120,
        helpfulCount: 45,
        notHelpfulCount: 5,
        isPublished: true
      },
      {
        title: 'Fixing Laptop Battery Charging Problems',
        content: `
# Fixing Laptop Battery Charging Problems

If your laptop battery isn't charging, try these solutions:

## 1. Check the Power Connections
- Ensure the power adapter is firmly connected to both the laptop and the wall outlet
- Inspect the power cable for any damage or fraying
- Try a different power outlet

## 2. Examine the Power Adapter
- Look for any damage to the power brick or cables
- Check if the LED light on the power adapter (if present) is lit
- If possible, try using a different compatible power adapter

## 3. Remove and Reinsert the Battery (if removable)
- Shut down your laptop completely
- Remove the battery
- Hold the power button for 30 seconds to discharge residual power
- Reinsert the battery and try charging again

## 4. Check for Overheating
- An overheated laptop may stop charging as a safety measure
- Ensure vents are clean and not blocked
- Use a cooling pad if necessary

## 5. Update BIOS and Drivers
- Outdated BIOS or drivers can cause charging issues
- Check the manufacturer's website for updates

## 6. Battery Calibration
- Let your battery drain completely
- Charge it to 100% without interruption
- This can help recalibrate the battery meter

If these steps don't resolve the issue, your battery or charging port may need replacement. Contact Dern-Support for professional assistance!
        `,
        deviceTypes: ['laptop'],
        category: 'hardware',
        tags: ['battery', 'charging', 'power', 'laptop'],
        author: admin._id,
        viewCount: 95,
        helpfulCount: 38,
        notHelpfulCount: 3,
        isPublished: true
      },
      {
        title: 'Securing Your Home Wi-Fi Network',
        content: `
# Securing Your Home Wi-Fi Network

Protect your home network with these essential security measures:

## 1. Change Default Login Credentials
- Access your router's admin panel (typically 192.168.0.1 or 192.168.1.1)
- Change the default username and password
- Use a strong, unique password

## 2. Update Router Firmware
- Check for firmware updates in your router's admin panel
- Keep your router updated to patch security vulnerabilities

## 3. Use Strong Encryption
- Configure your network to use WPA3 if available
- If WPA3 isn't available, use WPA2-PSK (AES)
- Never use WEP or WPA as they are insecure

## 4. Create a Strong Wi-Fi Password
- Use a password with at least 12 characters
- Include uppercase letters, lowercase letters, numbers, and symbols
- Avoid using personal information or common words

## 5. Enable Network Firewall
- Activate your router's built-in firewall
- Configure it to block unauthorized access

## 6. Use a Guest Network
- Set up a separate guest network for visitors
- This prevents guests from accessing your main network and connected devices

## 7. Disable WPS (Wi-Fi Protected Setup)
- WPS can be a security vulnerability
- Disable it in your router settings

## 8. Change Your Network Name (SSID)
- Don't use the default SSID
- Avoid including personal information in the name
- Consider hiding your SSID for additional security

For more advanced network security solutions, contact Dern-Support!
        `,
        deviceTypes: ['network'],
        category: 'security',
        tags: ['wifi', 'network', 'security', 'router'],
        author: admin._id,
        viewCount: 150,
        helpfulCount: 62,
        notHelpfulCount: 8,
        isPublished: true
      },
      {
        title: 'Smartphone Battery Saving Tips',
        content: `
# Smartphone Battery Saving Tips

Extend your smartphone's battery life with these practical tips:

## 1. Adjust Screen Brightness
- Lower your screen brightness or use auto-brightness
- This is one of the biggest battery drains

## 2. Manage App Usage
- Close unused apps running in the background
- Check battery usage statistics to identify power-hungry apps
- Uninstall apps you rarely use

## 3. Enable Battery Saver Mode
- Use your phone's built-in battery saver or low power mode
- This limits background activity and performance to save power

## 4. Turn Off Unnecessary Connections
- Disable Wi-Fi, Bluetooth, and GPS when not in use
- Turn off mobile data when you have a Wi-Fi connection

## 5. Manage Notifications
- Limit push notifications to essential apps
- Each notification wakes your screen and uses battery

## 6. Update Your Operating System
- Keep your phone's OS updated
- Updates often include battery optimization improvements

## 7. Adjust Screen Timeout
- Set your screen to turn off quickly when not in use
- A 30-second timeout is a good balance

## 8. Use Dark Mode
- If your phone has an OLED screen, dark mode can save battery
- Many apps now support dark mode

## 9. Avoid Extreme Temperatures
- Don't leave your phone in hot or cold environments
- Heat especially degrades battery performance

## 10. Optimize Charging Habits
- Avoid letting your battery drain completely
- Try to keep it between 20% and 80% for optimal battery health

Need more help with your smartphone? Contact Dern-Support for professional assistance!
        `,
        deviceTypes: ['smartphone'],
        category: 'maintenance',
        tags: ['battery', 'smartphone', 'power', 'optimization'],
        author: admin._id,
        viewCount: 200,
        helpfulCount: 85,
        notHelpfulCount: 10,
        isPublished: true
      },
      {
        title: 'Printer Troubleshooting Guide',
        content: `
# Printer Troubleshooting Guide

Resolve common printer issues with these troubleshooting steps:

## 1. Paper Jams
- Turn off the printer
- Gently remove jammed paper, pulling in the direction of paper path
- Check for and remove any torn pieces
- Restart the printer

## 2. Poor Print Quality
- Run the printer's cleaning utility
- Check ink or toner levels and replace if necessary
- Ensure you're using the correct paper type
- Print a test page to check alignment

## 3. Printer Not Responding
- Check all cable connections
- Restart both the printer and computer
- Ensure the printer is online in the settings
- Reinstall or update printer drivers

## 4. Wi-Fi Printing Issues
- Confirm the printer is connected to the correct network
- Restart your router
- Move the printer closer to the router if possible
- Check if the printer's IP address has changed

## 5. Error Messages
- Look up the specific error code in your printer's manual
- Clear the error and restart the printer
- Check for firmware updates

## 6. Streaks or Lines on Prints
- Clean the print heads using the printer utility
- For laser printers, the drum or toner may need replacement
- For inkjet printers, align the print heads

## 7. Slow Printing
- Reduce print quality for draft documents
- Print in black and white when color isn't needed
- Close unused applications while printing
- Check for and remove unnecessary print jobs in the queue

For persistent printer problems, contact Dern-Support for professional diagnosis and repair!
        `,
        deviceTypes: ['printer'],
        category: 'troubleshooting',
        tags: ['printer', 'printing', 'troubleshooting', 'ink'],
        author: admin._id,
        viewCount: 180,
        helpfulCount: 70,
        notHelpfulCount: 12,
        isPublished: true
      }
    ];
    
    await KnowledgeBase.insertMany(knowledgeBaseArticles);
    console.log('Created sample knowledge base articles');
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}