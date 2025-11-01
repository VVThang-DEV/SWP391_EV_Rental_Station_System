import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Phone,
  Mail,
  Shield,
  CheckCircle,
  Plus,
  Eye,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WalkInCustomer, WalkInCustomerForm } from "./types";

interface WalkInCustomerManagerProps {
  customers: WalkInCustomer[];
  onCustomersChange: (customers: WalkInCustomer[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const WalkInCustomerManager: React.FC<WalkInCustomerManagerProps> = ({
  customers,
  onCustomersChange,
  searchQuery,
  onSearchChange,
}) => {
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<WalkInCustomer | null>(null);
  const [newCustomer, setNewCustomer] = useState<WalkInCustomerForm>({
    fullName: "",
    phone: "",
    email: "",
    licenseNumber: "",
    idNumber: "",
    address: "",
  });
  const { toast } = useToast();

  const handleCreateCustomer = () => {
    if (!newCustomer.fullName || !newCustomer.phone || !newCustomer.licenseNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const customer: WalkInCustomer = {
      id: `C${Date.now()}`,
      ...newCustomer,
      documentsVerified: false,
      licenseVerified: false,
    };

    onCustomersChange([...customers, customer]);
    setNewCustomer({
      fullName: "",
      phone: "",
      email: "",
      licenseNumber: "",
      idNumber: "",
      address: "",
    });
    setIsCustomerDialogOpen(false);
    
    toast({
      title: "Customer Created",
      description: `${customer.fullName} has been added to the system`,
    });
  };

  const handleViewCustomer = (customer: WalkInCustomer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.licenseNumber.includes(searchQuery)
  );

  return (
    <div className="space-y-4">
      {/* Search and Add Customer */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, phone, or license..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsCustomerDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map(customer => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{customer.fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {customer.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-sm">{customer.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-mono">{customer.licenseNumber}</div>
                  </TableCell>
                  <TableCell>
                    {customer.licenseVerified ? (
                      <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
                        <Shield className="h-3 w-3 mr-1" />
                        Not Verified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewCustomer(customer)}
                      title="View customer details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Customer Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={newCustomer.fullName}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+84 90 123 4567"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                placeholder="customer@email.com"
              />
            </div>
            <div>
              <Label htmlFor="licenseNumber">License Number *</Label>
              <Input
                id="licenseNumber"
                value={newCustomer.licenseNumber}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, licenseNumber: e.target.value }))}
                placeholder="A123456789"
              />
            </div>
            <div>
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                value={newCustomer.idNumber}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, idNumber: e.target.value }))}
                placeholder="123456789"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Le Loi, District 1, HCMC"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCustomer}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Customer Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4 py-4">
              {/* Customer Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="font-medium">{selectedCustomer.fullName}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Customer ID</Label>
                  <div className="mt-1 text-sm font-mono text-muted-foreground">
                    {selectedCustomer.id}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="pt-4 border-t">
                <Label className="text-sm font-semibold mb-3 block">Contact Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone Number</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedCustomer.phone}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedCustomer.email || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="pt-4 border-t">
                <Label className="text-sm font-semibold mb-3 block">Documents</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">License Number</Label>
                    <div className="mt-1 text-sm font-mono">{selectedCustomer.licenseNumber}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">ID Number (CCCD/CMND)</Label>
                    <div className="mt-1 text-sm font-mono">{selectedCustomer.idNumber || "N/A"}</div>
                  </div>
                </div>
              </div>

              {/* Address */}
              {selectedCustomer.address && (
                <div className="pt-4 border-t">
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <div className="mt-1 text-sm">{selectedCustomer.address}</div>
                </div>
              )}

              {/* Verification Status */}
              <div className="pt-4 border-t">
                <Label className="text-sm font-semibold mb-3 block">Verification Status</Label>
                <div className="flex gap-2">
                  {selectedCustomer.licenseVerified ? (
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      License Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                      <Shield className="h-3 w-3 mr-1" />
                      License Not Verified
                    </Badge>
                  )}
                  {selectedCustomer.documentsVerified ? (
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Documents Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                      <Shield className="h-3 w-3 mr-1" />
                      Documents Not Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalkInCustomerManager;
