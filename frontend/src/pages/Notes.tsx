import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from '@mui/material';

interface Note {
  id: number;
  title: string;
  content: string;
}

const API_BASE = 'http://localhost:3000/api/notes';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [dialog, setDialog] = useState<{ open: boolean; targetId: number | null }>({ open: false, targetId: null });
  const [titleError, setTitleError] = useState(false);

  // メッセージ表示ヘルパー
  const showMessage = useCallback((message: string) => {
    setSnackbar({ open: true, message });
  }, []);

  // メモ一覧取得
  const fetchNotes = useCallback(async () => {
    try {
      const res = await axios.get<Note[]>(API_BASE);
      setNotes(res.data);
    } catch {
      showMessage('メモの取得に失敗しました');
    }
  }, [showMessage]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // メモ追加処理
  const handleAdd = async () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    setTitleError(false);

    try {
      await axios.post(API_BASE, { title, content });
      setTitle('');
      setContent('');
      fetchNotes();
      showMessage('メモを追加しました！');
    } catch {
      showMessage('メモの追加に失敗しました');
    }
  };

  // 削除ダイアログ表示
  const handleDeleteClick = (id: number) => {
    setDialog({ open: true, targetId: id });
  };

  // 削除確定
  const handleDeleteConfirm = async () => {
    if (!dialog.targetId) return;

    try {
      await axios.delete(`${API_BASE}/${dialog.targetId}`);
      fetchNotes();
      showMessage('メモを削除しました！');
    } catch {
      showMessage('メモの削除に失敗しました');
    } finally {
      setDialog({ open: false, targetId: null });
    }
  };

  // ダイアログ閉じる
  const handleDialogClose = () => {
    setDialog({ open: false, targetId: null });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <h1>メモアプリ</h1>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            label="タイトル"
            value={title}
            onChange={e => setTitle(e.target.value)}
            margin="normal"
            error={titleError}
            helperText={titleError ? 'タイトルは必須です' : ''}
          />
        </Grid>
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            label="本文"
            value={content}
            multiline
            rows={4}
            onChange={e => setContent(e.target.value)}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button variant="contained" fullWidth onClick={handleAdd} sx={{ mt: 2 }}>
            追加
          </Button>
        </Grid>
      </Grid>

      <List sx={{ mt: 4 }}>
        {notes.map(note => (
          <Paper key={note.id} sx={{ mb: 2, p: 2 }}>
            <ListItem
              secondaryAction={
                <Button variant="outlined" color="error" onClick={() => handleDeleteClick(note.id)}>
                  削除
                </Button>
              }
            >
              <ListItemText primary={note.title} secondary={note.content} />
            </ListItem>
          </Paper>
        ))}
      </List>

      {/* 削除確認ダイアログ */}
      <Dialog open={dialog.open} onClose={handleDialogClose}>
        <DialogTitle>削除の確認</DialogTitle>
        <DialogContent>
          <DialogContentText>このメモを本当に削除しますか？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>キャンセル</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            削除する
          </Button>
        </DialogActions>
      </Dialog>

      {/* スナックバー通知 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
