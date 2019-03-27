var express = require('express');
var path = require('path')
var app = express();
var md5 = require('md5');
var jwt = require('jsonwebtoken');
var multer = require('multer')
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
var mysql = require('mysql');
var token1;
var con = mysql.createConnection
	({
		host: "remotemysql.com",
		user: "iTR26SxUTP",
		password: "yYBdiwoxni",
		database: "iTR26SxUTP"
	})
con.connect(function (err) {
	if (err) throw err;
	console.log("connected! yo db");
});

// ******************      MULTER CONFIGURATION     *************
const multerConfig = {

	storage: multer.diskStorage({
		//Setup where the user's file will go
		destination: function (req, file, next) {
			next(null, './frontend/assets/user_images');
		},

		//Then give the file a unique name
		filename: function (req, file, next) {
			console.log(file);
			const ext = file.mimetype.split('/')[1];
			next(null, file.fieldname + '-' + Date.now() + '.' + ext);
		}
	}),

	//A means of ensuring only images are uploaded.
	fileFilter: function (req, file, next) {
		if (!file) {
			next();
		}
		const image = file.mimetype.startsWith('image/');
		if (image) {
			console.log('photo uploaded');
			next(null, true);
		} else {
			console.log("file not supported");

			//TODO:  A better message response to user on failure.
			return next();
		}
	}
};


app.use(express.static('./frontend/assets'));

app.get('/', function (req, res) {
	console.log("your index page has loaded successfully");
	res.sendFile(path.resolve('./frontend/index.html'));
})
app.get('/teacherlogin', function (req, res) {
	console.log("your teacher page has loaded successfully");
	res.sendFile(path.resolve('./frontend/assets/html/teacher_login.html'));
})
app.get('/studentlogin', function (req, res) {
	console.log("your student page has loaded successfully");
	res.sendFile(path.resolve('./frontend/assets/html/student_login.html'));
})
app.get('/newstudent', function (req, res) {
	console.log("your signup page for student has loaded successfully");
	res.sendFile(path.resolve('./frontend/assets/html/student_signup.html'));
})
app.get('/newteacher', function (req, res) {
	console.log("your signup page for teacher has loaded successfully");
	res.sendFile(path.resolve('./frontend/assets/html/teacher_signup.html'));
})
app.get('/student_details', function (req, res) {
	console.log("your student details page has loaded successfully");
	res.sendFile(path.resolve('./frontend/assets/html/student_details.html'));
})
app.get('/teacher_details', function (req, res) {
	console.log("your teacher details page has loaded successfully");
	res.sendFile(path.resolve('./frontend/assets/html/teacher_details.html'));
})
app.get("/forgot_password", function (req, res) {
	console.log("your forgotpassword page has loaded successfully");
	res.sendFile(path.resolve('./frontend/assets/html/forgot_password.html'));
})
app.post('/process_stud', function (req, res) {
	console.log("the request is ", req.body.login_id);
	var sql = "select * from users where roll_no = ? or email_id=?";
	con.query(sql, [req.body.login_id, req.body.login_id], function (err, result) {
		if (err) throw err;
		if (result.length <= 0) {
			res.end("Please! check your username once");
		}
		if (result.length == 1) {
			if (result[0].role_id == '1') {
				if ((result[0].password) == (md5(req.body.password))) {

					var date = new Date();
					console.log(date);
					var token1;
					jwt.sign({ date }, 'i_am_alok', function (err, token)//token assigned in this line
					{
						token1 = token;
						console.log(token);
						req.header['x-access-token'] = token;
						con.query("update users set  login_token=?  where email_id=?", [token, result[0].email_id], function (err, result1) {
							if (err) throw err;
							var data = {
								token: token1,
								id: result[0].id,
								status: "success"
							};
							console.log(data)
							res.send(data);
						})

					});

				} else {
					res.sendFile(path.resolve('./frontend/assets/html/404_FORBIDDEN.html'));
				}
			} else { res.sendFile(path.resolve('./frontend/assets/html/404_FORBIDDEN.html')); }

		}
	})

	console.log("your student login page is processing some request");
	// res.end("WRONG CREDENTIALS");
})
app.post('/student_details', function (req, res) {
	console.log('the request in student_details page is ', req.body)
	if (req.body.token == undefined) {
		res.send("401")
	}
	else {
		var sq = "select *from users where login_token=?";
		con.query(sq, [req.body.token], function (err, result) {
			if (err) throw err;
			console.log(result)
			res.send(result[0])
		})
	}
})

app.post('/teacher_details', function (req, res) {
	console.log('the request in teacher details is ', req.body)
	if (req.body.token == undefined) {
		res.send("401")
	}
	else {
		var sq = "select *from users where login_token=?";
		con.query(sq, [req.body.token], function (err, result) {
			if (err) throw err;
			console.log(result)
			res.send(result[0])
		})
	}
})

app.post('/process_teach', function (req, res) {
	var sql = "select * from users where roll_no = ? or email_id=?";
	con.query(sql, [req.body.emp_id, req.body.emp_id], function (err, result) {
		if (err) throw err;

		if (result.length <= 0) {
			res.end("Please! check your username once");
		}

		if (result.length == 1) {
			if (result[0].role_id == '2') {
				if ((result[0].password) == (md5(req.body.password))) {

					var date = new Date();
					console.log(date);
					var token1;
					jwt.sign({ date }, 'i_am_alok', function (err, token)//token assigned in this line
					{
						token1 = token;
						req.header['x-access-token'] = token;
						con.query("update users set  login_token=?  where email_id=?", [token1, result[0].email_id], function (err, result1) {
							if (err) throw err;
							var data = {
								token: token1,
								id: result[0].id,
								status: "success"
							};
							res.send(data);
						})
					});
				} else {
					res.sendFile(path.resolve('./frontend/assets/html/404_FORBIDDEN.html'));
				}
			} else { res.sendFile(path.resolve('./frontend/assets/html/404_FORBIDDEN.html')); }
		}
	})
	console.log("your teacher login page is processing some request");
})
app.post('/register_stud', multer(multerConfig).single('pc'), function (req, res) {
	console.log(req.body);
	var sql = "select * from users where roll_no = ? or mobile_number=? or email_id=? ";
	con.query(sql, [req.body.roll_no, req.body.mobile, req.body.email], function (err, result) {
		//console.log("the length is    ",result.length);
		if (err) throw err;
		if (result.length > 0) {
			res.end("roll_no or mobile_no or the email_id already exists! please check them once");
		} else {
			//var upload = multer({storage: storage,}).single('userFile');
			var data = new Date(); // without jquery remove this $.now()
			//console.log(data)// Thu Jun 23 2016 15:48:24 GMT+0530 (IST)

			var sql = "insert into users(first_name, last_name, dob, roll_no, branch_id,email_id, mobile_number, password, created_at, modified_at,image,role_id) values(?,?,?,?,?,?,?,?,?,?,?,?)";
			con.query(sql, [req.body.first_name, req.body.last_name, req.body.dob, req.body.roll_no, req.body.branch, req.body.email, req.body.mobile, md5(req.body.password), data, data, req.file.filename, '1'], function (err, result) {
				if (err) throw err;
				console.log("user added to db with id " + result.insertId);
			})
			res.sendFile(path.resolve('./frontend/assets/html/student_login.html'));
		}
	})
})

app.post('/register_teach', multer(multerConfig).single('pc'), function (req, res) {
	// console.log("FILE NAME ",req.file.originalname)
	var sql = "select * from users where roll_no = ? or mobile_number=? or email_id=? ";
	con.query(sql, [req.body.emp_id, req.body.mobile, req.body.email], function (err, result) {
		if (err) throw err;
		if (result.length > 0) {
			res.end("emp_id or mobile_no or the email_id already exists! please check them once");
		} else {
			var data = new Date();
			console.log(data)// Thu Jun 23 2016 15:48:24 GMT+0530 (IST)

			var sql = "insert into users(first_name, last_name, dob, roll_no, branch_id,email_id, mobile_number, password, created_at,modified_at,image,role_id) values(?,?,?,?,?,?,?,?,?,?,?,?)";
			con.query(sql, [req.body.first_name, req.body.last_name, req.body.dob, req.body.emp_id, req.body.department, req.body.email, req.body.mobile, md5(req.body.password), data, data, req.file.filename, '2'], function (err, result) {
				if (err) throw err;
				console.log("user added to db with id " + result.insertId);
			})
			res.sendFile(path.resolve('./frontend/assets/html/teacher_login.html'));
		}
	})
})
app.post('/forgot_password', function (req, res) {
	var sql = "select * from users where email_id=?"
	console.log("######### req #########",req.body)
	con.query(sql, [req.body.email], function (err, result) {
		if (err) throw err;
		if (result.length <= 0) {
			console.log("email did not match");
			res.send("401")
		} else {
			var sql1 = "update users set password=? where email_id=?";
			con.query(sql1, [md5(req.body.password), req.body.email], function (err, result1) {
				if (err)
					throw err;
				else {
					res.sendFile(path.resolve('./frontend/index.html'));
				}
			})

		}
	})
	console.log("your forgot password page has loaded successfully");
})
app.post('/marks', function (req, res) {
	console.log("********************REQUEST******************************")
	console.log("the request is ", req.body)
	//condition to be tested everytime
	var sql1 = "select login_token from users where id=?";
	con.query(sql1, [req.body.id], function (err, res1) {
		console.log(res1[0])
		if (err) throw err;
		else {
			if (req.body.token == res1[0].login_token) {//api k under queries
				q2 = "select s.subject_name,m.marks from subjects s join marks m on s.id=m.subject_id where m.user_id=?"
				con.query(q2, [req.body.id], function (err, result3) {
					if (err) throw err;
					console.log("the result of the query ie fired is", result3);
					var data = {
						result: result3,
						status: "success"
					};
					res.send(data);
				})
				// the above query is for the students to get their marks
			} else {
				// var data = { status: "your session has expired" };
				// res.send(data);
				res.sendFile(path.resolve('./frontend/assets/html/404_FORBIDDEN.html'));
			}
		}
	})
})
app.post('/teach_stud', function (req, res) {
	//condition to be tested everytime
	var sql1 = "select login_token from users where id=?";
	con.query(sql1, [req.body.id], function (err, res1) {
		if (err) throw err;

		if (req.body.token == res1[0].login_token) {//api k under queries
			sql2 = "select id from users where roll_no =?"
			con.query(sql2, [req.body.roll_no], function (err, result0) {
				if (err) throw err;
				var m = result0[0].id
				console.log("the id is ", m);
				var date = new Date();
				var q1 = "update marks m set m.user_id=?, m.teacher_id=? where m.teacher_id=? and m.user_id=? ";//this query will
				// basically upddate everything if the teacher_id and the student_id/roll_no they match. but if we need the subject id ie  present there and also need to update marks that
				// in some other subject id
				con.query(q1, [m, req.body.id, req.body.id, m], function (err, result) {
					if (err) throw err;
					var k = result.affectedRows;
					console.log("the result comes out to be  ", result.affectedRows);
					if (k == 0) {
						var q2 = "insert into marks(subject_id, user_id, teacher_id, modified_at) values(?,?,?,?)";
						con.query(q2, [req.body.sub_id, m, req.body.id, date], function (err, result3) {
							if (err) throw err;
							console.log("the number of affectedRows are after this  : ", result3.affectedRows);
							var q3 = "select s.subject_name,m.marks, m.subject_id from subjects s join marks m on s.id=m.subject_id where m.teacher_id=? and m.user_id=? and m.subject_id=?"//select marks from marks where teacher_id=? and user_id=?
							con.query(q3, [req.body.id, m, req.body.sub_id], function (err, result2) {
								if (err) throw err;
								console.log("the marks right now of this student are  and this is responnse 1", result2);
								var data = {
									marks: result2,
									status: "the marks have been sent to you",
									token: req.body.token,
									id: req.body.id
								}
								res.send(data);
							})
						})
					} else {
						var q3 = "select subject_id from marks where teacher_id = ? and user_id=?  "
						con.query(q3, [req.body.id, m], function (err, result3) {
							if (err) throw err;
							console.log("the subject id that are present with the entered user id and teacher id  ", result3);
							console.log("the value of m is   ", m);
							if (result3.length == 1) {
								if (result3[0].subject_id == req.body.sub_id) {
									q2 = "select s.subject_name,m.marks, m.subject_id from subjects s join marks m on s.id=m.subject_id where m.teacher_id=? and m.user_id=? and m.subject_id=?"//select marks from marks where teacher_id=? and user_id=?
									con.query(q2, [req.body.id, m, req.body.sub_id], function (err, result2) {
										if (err) throw err;
										console.log("the marks right now of this student are and this is responnse  2", result2);
										var data = {
											marks: result2,
											status: "the marks have been sent to you",
											token: req.body.token,
											id: req.body.id
										}
										//console.log(data);
										res.send(data);
									})
								} else {
									var q4 = "insert into marks(subject_id, user_id, teacher_id, modified_at) values(?,?,?,?)"
									con.query(q4, [req.body.sub_id, m, req.body.id, date], function (err, result4) {
										if (err) throw err;
										q2 = "select s.subject_name,m.marks , m.subject_id from subjects s join marks m on s.id=m.subject_id where m.teacher_id=? and m.user_id=? and m.subject_id=?"//select marks from marks where teacher_id=? and user_id=?
										con.query(q2, [req.body.id, m, req.body.sub_id], function (err, result2) {
											if (err) throw err;
											console.log("the marks right now of this student are and this is responnse  3", result2);
											var data = {
												marks: result2,
												status: "the marks and subject_name have been sent to you",
												token: req.body.token,
												id: req.body.id
											}
											//console.log(data);
											res.send(data);
										})

									})
								}
							} else {
								for (var i = 0; i < result3.length; i++) {
									if (result3[i].subject_id == req.body.sub_id) {
										q2 = "select s.subject_name,m.marks, m.subject_id from subjects s join marks m on s.id=m.subject_id where m.teacher_id=? and m.user_id=? and m.subject_id=?"//select marks from marks where teacher_id=? and user_id=?
										con.query(q2, [req.body.id, m, req.body.sub_id], function (err, result2) {
											if (err) throw err;
											console.log("the marks right now of this student are and this is responnse  4", result2);
											var data = {
												marks: result2,
												status: "the marks and subject_name have been sent to you",
												token: req.body.token,
												id: req.body.id
											}
											//console.log(data);
											res.send(data);
										})
									}
								}
								var c = 0;
								for (var i = 0; i < result3.length; i++) {
									if (result3[i].subject_id != req.body.sub_id) {
										c++;
									}
								}
								if (c == result3.length) {
									var q4 = "insert into marks(subject_id, user_id, teacher_id, modified_at) values(?,?,?,?)"
									con.query(q4, [req.body.sub_id, m, req.body.id, date], function (err, result4) {
										if (err) throw err;
										q2 = "select s.subject_name,m.marks, m.subject_id from subjects s join marks m on s.id=m.subject_id where m.teacher_id=? and m.user_id=? "//select marks from marks where teacher_id=? and user_id=?
										con.query(q2, [req.body.id, m, req.body.sub_id], function (err, result2) {
											if (err) throw err;
											var marks=[];
											marks.push(result2[c])

											console.log("the marks right now of this student are and this is responnse  5", marks);
											//console.log(result2[c]);
											// var marks = new Object();
											// marks.subject_name=  result2[c].subject_name
											// marks.marks = result2[c].marks
											// 	marks.subject_id =  result2[c].subject_id
											var data = {
												marks: marks,
												status: "the marks and subject_name have been sent to you",
												token: req.body.token,
												id: req.body.id
											}
											//console.log(data);
											res.send(data);
										})

									})
								}
							}
						})
					}//ending of the else with k!=0

				})
			})
		} else {
			// var data = { status: "session expired" }
			// res.send(data);
			res.sendFile(path.resolve('./frontend/assets/html/404_FORBIDDEN.html'));
		}

	})
})



app.post('/logout', function (req, res) {
	//condition to be tested everytime
	console.log("THe LOGOUT request is ", req.body)
	var sql1 = "select login_token from users where id=?";
	con.query(sql1, [req.body.id], function (err, res1) {
		if (err) throw err;
		else {
			if (req.body.token == res1[0].login_token) {//api k under queries
				var sql = "update  users set login_token = NULL where id =? "
				con.query(sql, [req.body.id], function (err, result) {
					if (err) throw err;
					console.log("the affected rows are has to be 1 ", result.affectedRows);
					res.end();
				})
			} else {
				var data = { status: "session expired" }
				res.send(data);
				//res.sendFile(path.resolve('./frontend/assets/html/404_FORBIDDEN.html'));
			}
		}
	})
})
app.post('/updateMarks', function (req, res) {
	//condition to be tested everytime
	var sql1 = "select login_token from users where id=?";
	con.query(sql1, [req.body.id], function (err, res1) {
		if (err) throw err;

		else {
			if (req.body.token == res1[0].login_token) {//api k under queries
				var date = new Date();
				var sql = "update marks set marks =?, modified_at=? where teacher_id=?  and subject_id=?"
				con.query(sql, [req.body.newmarks, date, req.body.id, req.body.sub_id], function (err, result) {
					if (err) throw err;
					res.end();
				})



			} else {
				// var data = { status: "session expired" }
				// res.send(data);
				res.sendFile(path.resolve('./frontend/assets/html/404_FORBIDDEN.html'));
			}
		}
	})

})
var port = process.env.PORT || 8081
var server = app.listen(port, function () {
	//var host = server.address().address
	//var port = server.address().port
	//console.log("Example app listening at http://%s:%s", host, port)
	console.log("app running")
})
