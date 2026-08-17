# Catnap Studio v0.3.3

## Better Sidebar compatibility

Catnap Studio now treats `dsh-better-sidebar` as an optional workbench base.
When it is installed, Catnap keeps its themes, companion, settings, task board,
and live statistics, while Better Sidebar owns the file, editor, terminal, and
Git workspace surfaces. The legacy Aion file panel and Git graph clients are
not activated, preventing duplicate sidebars.

Without Better Sidebar, Catnap retains its existing legacy workbench fallback.

## Install

```powershell
dsh plugin --profile web add dsh-catnap-plugins@0.3.3
```

Optionally install Better Sidebar:

```powershell
dsh plugin --profile web add dsh-better-sidebar@latest
```

Catnap adapts only through shared DSH tokens and module/service detection. It
does not bundle or redistribute Better Sidebar's terminal, filesystem,
WebSocket, or node-pty implementation.
