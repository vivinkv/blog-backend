const fs=require('fs');
const path=require('path');
const getRobotTxt = async (req, res) => {
    try {
        const filePath = path.join('', 'robot.txt');
        if (fs.existsSync(filePath)) {
            console.log(filePath);
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    return res.status(400).json({ err: err.message });
                }
                console.log(data);
                return res.render('robot/index', { data: data, title: "Robot.TXT" });
            });
        } else {
            res.render('robot/index', { data: 'Sample Content', title: "Robot.TXT" });
        }
    } catch (error) {
        res.status(500).json({ err: error.message });
    }
}
const createRobotTxt = (req, res) => {
    const { data } = req.body;
    console.log(req.body);
    try {
        fs.writeFile(path.join('', 'robot.txt'), data, { flag: 'w' }, (err) => {
            if (err) {
                return res.status(400).json({ err: err.message });
            }
            res.status(201).json({ msg: 'Created Successfully' });
        });
    } catch (error) {
        res.status(500).json({ err: error.message });
    }
}

module.exports={createRobotTxt,getRobotTxt}