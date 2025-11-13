import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Button,
  Chip,
  Collapse,
  TextField,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon,
  Clear as ClearIcon,
  BugReport as BugIcon
} from '@mui/icons-material';

const DebugConsole = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all'); // all, log, warn, error, api
  const logContainerRef = useRef(null);
  const textAreaRef = useRef(null);

  // Intercept console methods
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    // Override console.log
    console.log = (...args) => {
      originalConsoleLog(...args);
      addLog('log', args);
    };

    // Override console.warn
    console.warn = (...args) => {
      originalConsoleWarn(...args);
      addLog('warn', args);
    };

    // Override console.error
    console.error = (...args) => {
      originalConsoleError(...args);
      addLog('error', args);
    };

    // Intercept fetch API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;
      const method = options?.method || 'GET';

      addLog('api', [`→ ${method} ${url}`, options?.body]);

      try {
        const response = await originalFetch(...args);
        const clonedResponse = response.clone();

        try {
          const data = await clonedResponse.json();
          addLog('api', [`← ${response.status} ${method} ${url}`, data]);
        } catch {
          addLog('api', [`← ${response.status} ${method} ${url}`]);
        }

        return response;
      } catch (error) {
        addLog('error', [`✗ ${method} ${url} - ${error.message}`]);
        throw error;
      }
    };

    // Cleanup
    return () => {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
      window.fetch = originalFetch;
    };
  }, []);

  const addLog = (type, args) => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });

    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    // Defer state update to avoid setState during render
    setTimeout(() => {
      setLogs(prev => [...prev, { type, message, timestamp, id: Date.now() + Math.random() }]);
    }, 0);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (logContainerRef.current && isOpen) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  const getFilteredLogs = () => {
    if (filter === 'all') return logs;
    return logs.filter(log => log.type === filter);
  };

  const copyToClipboard = () => {
    const text = getFilteredLogs()
      .map(log => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`)
      .join('\n');

    navigator.clipboard.writeText(text).then(() => {
      alert('Logs copied to clipboard!');
    });
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'error': return '#f44336';
      case 'warn': return '#ff9800';
      case 'api': return '#2196f3';
      default: return '#4caf50';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'api': return '🌐';
      default: return '📝';
    }
  };

  const logCount = {
    all: logs.length,
    log: logs.filter(l => l.type === 'log').length,
    warn: logs.filter(l => l.type === 'warn').length,
    error: logs.filter(l => l.type === 'error').length,
    api: logs.filter(l => l.type === 'api').length,
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#1e1e1e',
        color: '#fff',
        maxHeight: isOpen ? '50vh' : '48px',
        transition: 'max-height 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          backgroundColor: '#2d2d2d',
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid #444' : 'none',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BugIcon sx={{ color: '#4caf50' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Debug Console
          </Typography>
          <Chip
            label={`${logs.length} logs`}
            size="small"
            sx={{
              backgroundColor: '#444',
              color: '#fff',
              fontWeight: 'bold'
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Filter Chips */}
          <Chip
            label={`All (${logCount.all})`}
            size="small"
            onClick={(e) => { e.stopPropagation(); setFilter('all'); }}
            sx={{
              backgroundColor: filter === 'all' ? '#4caf50' : '#555',
              color: '#fff',
              cursor: 'pointer',
              '&:hover': { backgroundColor: filter === 'all' ? '#45a049' : '#666' }
            }}
          />
          <Chip
            label={`📝 ${logCount.log}`}
            size="small"
            onClick={(e) => { e.stopPropagation(); setFilter('log'); }}
            sx={{
              backgroundColor: filter === 'log' ? '#4caf50' : '#555',
              color: '#fff',
              cursor: 'pointer',
              '&:hover': { backgroundColor: filter === 'log' ? '#45a049' : '#666' }
            }}
          />
          <Chip
            label={`⚠️ ${logCount.warn}`}
            size="small"
            onClick={(e) => { e.stopPropagation(); setFilter('warn'); }}
            sx={{
              backgroundColor: filter === 'warn' ? '#ff9800' : '#555',
              color: '#fff',
              cursor: 'pointer',
              '&:hover': { backgroundColor: filter === 'warn' ? '#f57c00' : '#666' }
            }}
          />
          <Chip
            label={`❌ ${logCount.error}`}
            size="small"
            onClick={(e) => { e.stopPropagation(); setFilter('error'); }}
            sx={{
              backgroundColor: filter === 'error' ? '#f44336' : '#555',
              color: '#fff',
              cursor: 'pointer',
              '&:hover': { backgroundColor: filter === 'error' ? '#d32f2f' : '#666' }
            }}
          />
          <Chip
            label={`🌐 ${logCount.api}`}
            size="small"
            onClick={(e) => { e.stopPropagation(); setFilter('api'); }}
            sx={{
              backgroundColor: filter === 'api' ? '#2196f3' : '#555',
              color: '#fff',
              cursor: 'pointer',
              '&:hover': { backgroundColor: filter === 'api' ? '#1976d2' : '#666' }
            }}
          />

          <Tooltip title="Copy all logs">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); copyToClipboard(); }}
              sx={{ color: '#fff' }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Clear logs">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); clearLogs(); }}
              sx={{ color: '#fff' }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
            sx={{ color: '#fff' }}
          >
            {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Logs Container */}
      <Collapse in={isOpen}>
        <Box
          ref={logContainerRef}
          sx={{
            maxHeight: 'calc(50vh - 48px)',
            overflowY: 'auto',
            padding: 2,
            backgroundColor: '#1e1e1e',
            fontFamily: '"Fira Code", "Courier New", monospace',
            fontSize: '12px',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#2d2d2d',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#555',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#666',
              },
            },
          }}
        >
          {getFilteredLogs().length === 0 ? (
            <Typography sx={{ color: '#888', textAlign: 'center', padding: 4 }}>
              No logs yet. Console activity will appear here.
            </Typography>
          ) : (
            getFilteredLogs().map((log) => (
              <Box
                key={log.id}
                sx={{
                  padding: '4px 8px',
                  marginBottom: '2px',
                  borderLeft: `3px solid ${getLogColor(log.type)}`,
                  backgroundColor: '#252525',
                  borderRadius: '2px',
                  '&:hover': {
                    backgroundColor: '#2d2d2d',
                  },
                }}
              >
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Typography
                    component="span"
                    sx={{
                      color: '#888',
                      fontSize: '11px',
                      minWidth: '90px',
                      flexShrink: 0,
                    }}
                  >
                    {log.timestamp}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '12px',
                      minWidth: '20px',
                      flexShrink: 0,
                    }}
                  >
                    {getLogIcon(log.type)}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      color: '#fff',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      flex: 1,
                    }}
                  >
                    {log.message}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* Copy-friendly text area (hidden but useful for copying) */}
        <Box sx={{ padding: 2, borderTop: '1px solid #444' }}>
          <Typography variant="caption" sx={{ color: '#888', marginBottom: 1, display: 'block' }}>
            Copy-friendly log text (select all and copy):
          </Typography>
          <TextField
            ref={textAreaRef}
            multiline
            fullWidth
            rows={3}
            value={getFilteredLogs()
              .map(log => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`)
              .join('\n')}
            sx={{
              fontFamily: '"Fira Code", "Courier New", monospace',
              fontSize: '11px',
              '& .MuiInputBase-root': {
                color: '#fff',
                backgroundColor: '#252525',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#444',
              },
            }}
            onClick={(e) => e.target.select()}
          />
        </Box>
      </Collapse>
    </Paper>
  );
};

export default DebugConsole;
