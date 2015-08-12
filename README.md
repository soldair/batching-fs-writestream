# batching-fs-writestream
writes files faster by writing data to disk in chunks rather then one syscall for each call to write as in `fs.createWriteStream` except buffers chunks of data while other writes are pending to batch them to dis
