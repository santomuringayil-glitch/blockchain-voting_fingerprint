const fs = require('fs');
const mongoose = require('mongoose');

async function updateImage() {
    const imagePath = 'c:/miniproject app/voting-app/public/candidate_linked_in.jpg';
    if (!fs.existsSync(imagePath)) {
        console.error('Image not found at:', imagePath);
        process.exit(1);
    }
    
    const image = fs.readFileSync(imagePath);
    const base64 = 'data:image/jpeg;base64,' + image.toString('base64');
    const uri = 'mongodb://blockvote:BlockVote2026@ac-vpu819z-shard-00-00.op0dtb3.mongodb.net:27017,ac-vpu819z-shard-00-01.op0dtb3.mongodb.net:27017,ac-vpu819z-shard-00-02.op0dtb3.mongodb.net:27017/voting-system?ssl=true&replicaSet=atlas-1rdckl-shard-0&authSource=admin&appName=blockvote';
    
    try {
        await mongoose.connect(uri);
        const result = await mongoose.connection.db.collection('candidates').updateOne(
            { fullName: 'Alex Blockchain' },
            { $set: { imageUrl: base64 } }
        );
        console.log('Successfully updated candidate image. Modified count:', result.modifiedCount);
    } catch (error) {
        console.error('Error updating candidate:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

updateImage();
