package types

import (
	"github.com/keybase/client/go/protocol/chat1"
	"github.com/keybase/client/go/protocol/keybase1"
)

type FetchType int

const (
	InboxLoad FetchType = iota
	ThreadLoad
)

type TLFInfo struct {
	ID               chat1.TLFID
	CanonicalName    string
	IdentifyFailures []keybase1.TLFIdentifyFailure
}
