use std::{fmt, error};

pub type Error = Box<dyn std::error::Error + Send + Sync + 'static>;

#[derive(Debug)]
pub struct ErrorBuilder {
    error_type: String,
    error_message: String,
}

impl ErrorBuilder {
    pub fn new(error_type: &str, error_message: &str) -> Box<Self> {
        Box::new(Self {
            error_type: error_type.to_string(),
            error_message: error_message.to_string(),
        })
    }
}

impl fmt::Display for ErrorBuilder {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "({}: {})",
            self.error_type, self.error_message
        )
    }
}

impl error::Error for ErrorBuilder {}